'use strict';

import {
  EXTENSION_ACTIVE,
  BROWSER_ACTION_STATE_ICONS
} from './config';

import {
  BrowserAction,
  BROWSER_ACTION_STATE_OFF,
  BROWSER_ACTION_STATE_ON
} from './chrome-extension/browser-action';

import {
  default as TabManager
} from './chrome-extension/tab-manager';

import {
  MESSAGE_AUDIO_BLUR,
  MESSAGE_AUDIO_FOCUS
} from './constants';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

class AudioFocus {
  constructor() {
    this.browserAction = new BrowserAction(BROWSER_ACTION_STATE_ICONS)
    this.tabManager = new TabManager()
    this.active = false
  }

  async init() {
    const self = this
    chrome.runtime.onInstalled.addListener(async (details) => {
      const tabs = await self.tabManager.getTabs({
        url: ["http://*/*", "https://*/*"]
      })
      /* 
       * when installed, the app won't execute conetent scripts automatically, thus, they must be added manually  
       */
      await self.tabManager.executeContentScripts(tabs)
      await self.tabManager.openPage('intro/intro.html')
    })

    chrome.storage.sync.get([EXTENSION_ACTIVE], async function (result) {
      self.active = result[EXTENSION_ACTIVE]
      await self.browserAction.setState(result[EXTENSION_ACTIVE] ? BROWSER_ACTION_STATE_ON : BROWSER_ACTION_STATE_OFF)
      self.browserAction.addOnClickListener(async function (tab) {
        const active = !self.active
        return new Promise((resolve, reject) => {
          chrome.storage.sync.set({
            [EXTENSION_ACTIVE]: active
          }, function () {
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
    let self = this
    chrome.storage.sync.set({
      [EXTENSION_ACTIVE]: true
    }, function () {
      self.browserAction.setState(BROWSER_ACTION_STATE_ON)
      if (activeTab.audible) {
        self.blurInactiveTabs(activeTab.id)
      } else {
        self.clearInactiveTabs(activeTab.id)
      }
    })
  }

  async deactivate() {
    let self = this
    chrome.storage.sync.set({
      [EXTENSION_ACTIVE]: true
    }, function () {
      self.clearAllTabs()
      self.browserAction.setState(BROWSER_ACTION_STATE_OFF)
    })
  }

  async blurInactiveTabs(activeTabId) {
    const tabs = await this.tabManager.getTabs({
      active: false
    })
    for (const tab of tabs) {
      this.tabManager.sendMessageToTab(tab, {
        what: MESSAGE_AUDIO_BLUR,
      })
    }
  }

  async blurActiveTab(activeTabId) {
    this.tabManager.sendMessageToTabById(activeTabId, {
      what: MESSAGE_AUDIO_BLUR,
    })
  }

  async clearInactiveTabs(activeTabId) {
    const tabs = await this.tabManager.getTabs({
      active: false
    })
    for (const tab of tabs) {
      this.tabManager.sendMessageToTab(tab, {
        what: MESSAGE_AUDIO_FOCUS,
      })
    }
  }

  async clearActiveTab(activeTabId) {
    await this.tabManager.sendMessageToTabById(activeTabId, {
      what: MESSAGE_AUDIO_FOCUS
    })
  }

  async clearAllTabs(actieTabId) {
    const allTabs = await this.tabManager.getAllTabs()
    for (const tab of allTabs) {
      await this.tabManager.sendMessageToTab(tab, {
        what: MESSAGE_AUDIO_FOCUS
      })
    }
  }
}

(new AudioFocus()).init()