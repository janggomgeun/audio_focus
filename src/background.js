'use strict';

import {
  BrowserAction,
  BROWSER_ACTION_STATE_OFF,
  BROWSER_ACTION_STATE_ON
} from './chrome-extension/browser-action';
import { default as TabManager } from './chrome-extension/tab-manager';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const EXTENSION_ACTIVE = 'extension_active'
class AudioFocus {
  constructor() {
    this.browserAction = new BrowserAction({
      [BROWSER_ACTION_STATE_OFF]: 'icons/icon_browser_action_inactive_128x128.png',
      [BROWSER_ACTION_STATE_ON]: 'icons/icon_browser_action_active_128x128.png'
    })
    this.tabManager = new TabManager()
    this.active = false
  }

  async init() {
    const self = this
    chrome.runtime.onInstalled.addListener((details) => {
      self.tabManager.getTabs({
        url: ["http://*/*", "https://*/*"]
      }).then((tabs) => {
        /* 
         * when installed, the app won't execute conetent scripts automatically, thus, they must be added manually  
         */
        return self.tabManager.executeContentScripts(tabs)
      }).then(() => {
        return self.tabManager.openOptionPage()
      })
    })

    chrome.storage.sync.get([EXTENSION_ACTIVE], async function (result) {
      self.active = result[EXTENSION_ACTIVE]
      await self.browserAction.setState(result[EXTENSION_ACTIVE] ? BROWSER_ACTION_STATE_ON : BROWSER_ACTION_STATE_OFF)
    })

    this.browserAction.addOnClickListener(async function (tab) {
      const active = !self.active
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [EXTENSION_ACTIVE]: active }, function () {
          self.active = active
          if (self.active) {
            console.log('browserAction >> activate()');
            self.activate()
          } else {
            console.log('browserAction >> deactivate()');
            self.deactivate()
          }
          self.browserAction.setState(self.active ? BROWSER_ACTION_STATE_ON : BROWSER_ACTION_STATE_OFF)
          resolve()
        })
      })
    })

    this.tabManager.addOnActivatedListener(async function (activeInfo) {
      console.log(`activeInfo: ${JSON.stringify(activeInfo)}`)
      const activeTab = self.tabManager.getTabById(activeInfo.tabId)
      if (activeTab.url) {
        if (activeTab.audible) {
          this.blurInactiveTabs(self.activeTabId)
        } else {
          this.clearInactiveTabs(self.activeTabId)
        }
      }
    })

    this.tabManager.addOnUpdatedListener(async function (tabId, changeInfo, tab) {
      console.log(`tabId: ${tabId}`);
      console.log(`changeInfo: ${JSON.stringify(changeInfo)}`);
      console.log(`tab: ${JSON.stringify(tab)}`);
      if (tab.url && tab.active) {
        if (tab.audible) {
          self.blurInactiveTabs(tabId)
        } else {
          self.clearInactiveTabs(tabId)
        }
      }
    })

    if (this.active) {
      this.activate()
    } else {
      this.deactivate()
    }
  }

  async activate() {
    console.log(`activate`);
    console.log(`activeTab: ${JSON.stringify(this.activeTabId)}`);
    const activeTab = await this.tabManager.getActiveTab()
    console.log(`activeTab: ${JSON.stringify(activeTab)}`);
    if (activeTab.audible) {
      await this.blurInactiveTabs(activeTab.id)
    } else {
      await this.clearInactiveTabs(activeTab.id)
    }

    let self = this
    chrome.storage.sync.set({[EXTENSION_ACTIVE]: true}, async function() {
      await self.browserAction.setIcon({
        path: "icons/icon_browser_action_active_128x128.png"
      })
    })
  }

  async deactivate() {
    await this.clearAllTabs()
    let self = this
    chrome.storage.sync.set({[EXTENSION_ACTIVE]: true}, async function() {
      await self.browserAction.setIcon({
        path: "icons/icon_browser_action_inactive_128x128.png"
      })
    })
  }

  async blurInactiveTabs(activeTabId) {
    console.log(`blurInactiveTabs`)
    const tabs = await this.tabManager.getAllTabs()
    for (const tab of tabs) {
      if (tab.id !== activeTabId) {
        chrome.tabs.sendMessage(tab.id, {
          what: "af_blur",
        })
      }
    }
  }

  async clearInactiveTabs(activeTabId) {
    console.log(`clearInactiveTabs(${activeTabId})`);
    const tabs = await this.tabManager.getAllTabs()
    for (const tab of tabs) {
      if (tab.id !== activeTabId) {
        chrome.tabs.sendMessage(tab.id, {
          what: "af_clear",
        })
      }
    }
  }

  async clearAllTabs(actieTabId) {
    console.log('clearAllTabs');
    const allTabs = await this.tabManager.getAllTabs()
    for (const tab of allTabs) {
      await this.tabManager.sendMessageToTab(tab, {
        what: "af_clear"
      })
    }
  }
}

(new AudioFocus()).init()