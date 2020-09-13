'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

class CommandManager {
  addOnCommandListener(onCommand) {
    chrome.commands.onCommand.addListener(onCommand)
  }
}

class BrowserAction {
  constructor(options) {}

  async setIcon(details) {
    return new Promise(function (resolve, reject) {
      chrome.browserAction.setIcon(details, function () {
        resolve()
      })
    })
  }

  addOnClickListener(onClicked) {
    chrome.browserAction.onClicked.addListener(onClicked)
  }
}

class TabManager {
  constructor() {
    this.tabs = null
  }

  async openOptionPage() {
    const properties = {
      url: "options/options.html",
      active: true
    }
    await this.createTab(properties)
  }

  async createTab(properties) {
    return new Promise(function (resolve, reject) {
      chrome.tabs.create(properties, function () {
        resolve()
      })
    })
  }

  async getAllTabs() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({
        url: ["http://*/*", "https://*/*"]
      }, function (tabs) {
        resolve(tabs)
      })
    })
  }

  async getTabs(query) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(query, function (tabs) {
        resolve(tabs)
      })
    })
  }

  async getActiveTab() {
    const query = {
      active: true,
      currentWindow: true
    }
    const tabs = await this.getTabs(query)
    return tabs[0]
  }

  async executeContentScripts(tabs) {
    const self = this
    return new Promise(function (resolve, reject) {
      for (const tab of tabs) {
        resolve(self.executeContentScript(tab))
      }
    })
  }

  async executeContentScript(tab) {
    return new Promise(function (resolve, reject) {
      chrome.tabs.executeScript(tab.id, {
        file: "content/content.js"
      }, function () {
        resolve()
      })
    })
  }

  async sendMessageToTab(tab, message) {
    return new Promise(function (resolve, reject) {
      chrome.tabs.sendMessage(tab.id, message, function (response) {
        resolve()
      })
    })
  }

  addOnActivatedListener(onActivated) {
    chrome.tabs.onActivated.addListener(onActivated)
  }

  addOnRemovedListener(onRemoved) {
    chrome.tabs.onRemoved.addListener(onRemoved)
  }

  addOnUpdatedListener(onUpdated) {
    chrome.tabs.onUpdated.addListener(onUpdated)
  }
}

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

    this.environment.addOnOptionsChangedListener(function (options) {
      self.broadcastOptionsChange(options)
    })

    await this.browserAction.setIcon({
      // imageData: null,
      path: this.environment.pref.on ? "icons/icon_browser_action_active_128x128.png" : "icons/icon_browser_action_inactive_128x128.png",
      // tabId: undefined
    })

    this.browserAction.addOnClickListener(async function (tab) {
      await self.toggle()
    })

    this.tabManager.addOnActivatedListener(async function (activeInfo) {
      self.activeTabId = activeInfo.tabId
      if (self.environment.pref.on) {
        self.activate()
      }
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
            sendResponse({
              options: this.environment.pref.options
            })
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

  async toggle() {
    const on = !this.environment.pref.on
    await this.environment.updateOn(on)
    if (on) {
      const tab = await this.tabManager.getActiveTab()
      this.activeTabId = tab.id
      await this.activate()
    } else {
      await this.deactivate()
    }
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

  async broadcastActiveTabChange(activeTabId) {
    const tabs = await this.tabManager.getAllTabs()
    for (const tab of tabs) {
      if (tab.id === activeTabId) {
        chrome.tabs.sendMessage(tab.id, {
          what: "af_tab_active",

        })
      } else {
        chrome.tabs.sendMessage(tab.id, {
          what: "af_tab_inactive"
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