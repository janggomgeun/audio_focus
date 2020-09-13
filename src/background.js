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
      self.browserAction.addOnClickListener(async function (tab) {
        const active = !self.active
        return new Promise((resolve, reject) => {
          chrome.storage.sync.set({ [EXTENSION_ACTIVE]: active }, function () {
            self.active = active
            if (self.active) {
              self.activate()
            } else {
              self.deactivate()
            }
            self.browserAction.setState(self.active ? BROWSER_ACTION_STATE_ON : BROWSER_ACTION_STATE_OFF)
            resolve()
          })
        })
      })
  
      self.tabManager.addOnActivatedListener(async function (activeInfo) {
        const activeTab = await self.tabManager.getTabById(activeInfo.tabId)
        if (self.active && activeTab.url) {
          if (activeTab.audible) {
            self.clearActiveTab(activeTab.id)
            self.blurInactiveTabs(activeTab.id)
          } else {
            self.blurActiveTab(activeTab.id)
            self.clearInactiveTabs(activeTab.id)
          }
        }
      })
  
      self.tabManager.addOnUpdatedListener(async function (tabId, changeInfo, tab) {
        if (self.active && tab.url && tab.active) {
          if (tab.audible) {
            self.clearActiveTab(tabId)
            self.blurInactiveTabs(tabId)
          } else {
            self.blurActiveTab(tabId)
            self.clearInactiveTabs(tabId)
          }
        }
      })
  
      if (self.active) {
        self.activate()
      } else {
        self.deactivate()
      }
    })

  }

  async activate() {
    const activeTab = await this.tabManager.getActiveTab()
    if (activeTab.audible) {
      await this.blurInactiveTabs(activeTab.id)
    } else {
      await this.clearInactiveTabs(activeTab.id)
    }

    let self = this
    chrome.storage.sync.set({[EXTENSION_ACTIVE]: true}, async function() {
      await self.browserAction.setState(BROWSER_ACTION_STATE_ON)
    })
  }

  async deactivate() {
    await this.clearAllTabs()
    let self = this
    chrome.storage.sync.set({[EXTENSION_ACTIVE]: true}, async function() {
      await self.browserAction.setState(BROWSER_ACTION_STATE_OFF)
    })
  }

  async blurInactiveTabs(activeTabId) {
    const tabs = await this.tabManager.getAllTabs()
    for (const tab of tabs) {
      if (tab.id !== activeTabId) {
        this.tabManager.sendMessageToTab(tab, {
          what: "af-blur",
        })
      }
    }
  }

  async blurActiveTab(activeTabId) {
    this.tabManager.sendMessageToTabById(activeTabId, {
      what: "af-blur",
    })
  }

  async clearInactiveTabs(activeTabId) {
    const tabs = await this.tabManager.getAllTabs()
    for (const tab of tabs) {
      if (tab.id !== activeTabId) {
        this.tabManager.sendMessageToTab(tab, {
          what: "af-clear",
        })
      }
    }
  }

  async clearActiveTab(activeTabId) {
    await this.tabManager.sendMessageToTabById(activeTabId, {
      what: "af-clear"
    })
  }

  async clearAllTabs(actieTabId) {
    const allTabs = await this.tabManager.getAllTabs()
    for (const tab of allTabs) {
      await this.tabManager.sendMessageToTab(tab, {
        what: "af-clear"
      })
    }
  }
}

(new AudioFocus()).init()