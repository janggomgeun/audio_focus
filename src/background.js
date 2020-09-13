'use strict';

import {
  BrowserAction,
  BROWSER_ACTION_STATE,
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
    this.activeTabId = -1
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
          self.browserAction.setState(self.active ? BROWSER_ACTION_STATE_ON : BROWSER_ACTION_STATE_OFF)
          resolve()
        })
      })
    })

    this.tabManager.addOnActivatedListener(async function (activeInfo) {
      console.log(`activeInfo: ${activeInfo}`);
      self.activeTabId = activeInfo.tabId
    })

    this.tabManager.addOnUpdatedListener(async function (tabId, changeInfo, tab) {
      console.log(`tabId: ${tabId}`);
      console.log(`changeInfo: ${JSON.stringify(changeInfo)}`);
      console.log(`tab: ${JSON.stringify(tab)}`);
      if (changeInfo.url) {
        await self.tabManager.sendMessageToTab(tab, {
          what: "af_update"
        })
      }
    })

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.what) {
        case 'af-page-init':
          break

        case 'af-page-media-playing':
          this.broadcastAudioPlaying(this.activeTabId)
          break

        case 'af-page-media-stopped':
          this.broadcastAudioStopped(this.activeTabId)
          break
      }
    });
  }

  async activate() {
    await this.broadcastActiveTabChange(this.activeTabId)
    await this.browserAction.setIcon({
      path: "icons/icon_browser_action_active_128x128.png"
    })
    await this.environment.updateOn(true)
  }

  async broadcastAudioPlaying(activeTabId) {
    const tabs = await this.tabManager.getAllTabs()
    for (const tab of tabs) {
      if (tab.id !== activeTabId) {
        chrome.tabs.sendMessage(tab.id, {
          what: "af_blur",
        })
      }
    }
  }

  async broadcastAudioStopped(activeTabId) {
    const tabs = await this.tabManager.getAllTabs()
    for (const tab of tabs) {
      if (tab.id !== activeTabId) {
        chrome.tabs.sendMessage(tab.id, {
          what: "af_clear",
        })
      }
    }
  }

  async deactivate() {
    const allTabs = await this.tabManager.getAllTabs()
    for (const tab of allTabs) {
      await this.tabManager.sendMessageToTab(tab, {
        what: "af_off"
      })
    }

    await this.browserAction.setIcon({
      path: "icons/icon_browser_action_inactive_128x128.png"
    })
    await this.environment.updateOn(false)
  }
}

(new AudioFocus()).init()