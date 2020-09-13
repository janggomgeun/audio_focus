'use strict';

const { default: BrowserAction } = require('./chrome-extension/browser-action');
const { default: TabManager } = require('./chrome-extension/tab-manager');
const { default: CommandManager } = require('./chrome-extension/command-manager');

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

class AudioFocus {
  constructor() {
    this.browserAction = new BrowserAction()
    this.tabManager = new TabManager()
    this.commandManager = new CommandManager()
    this.activeTabId = -1
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

    await this.browserAction.setIcon({
      // imageData: null,
      path: "icons/icon_browser_action_inactive_128x128.png"
      // tabId: undefined
    })

    this.browserAction.addOnClickListener(async function (tab) {
      await self.toggle()
    })

    this.tabManager.addOnActivatedListener(async function (activeInfo) {
      self.activeTabId = activeInfo.tabId
    })

    this.tabManager.addOnUpdatedListener(async function (tabId, changeInfo, tab) {
      if (changeInfo.url) {
        await self.tabManager.sendMessageToTab(tab, {
          what: "af_update"
        })
      }
    })

    this.commandManager.addOnCommandListener(async function (command) {
      const COMMANDS = {
        "toggle-audiofocus": self.toggle
      }

      if (COMMANDS[command]) {
        await COMMANDS[command]()
      }
    })

    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
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

console.log('background.js::init()');