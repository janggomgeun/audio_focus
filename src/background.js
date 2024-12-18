'use strict';

import {
  EXTENSION_ACTIVE,
  USER_PREFERENCES,
  BROWSER_ACTION_STATE_ICONS,
  AUDIO_FOCUS_SCHEMA,
  FOCUS_MODE,
  FOCUS_MODE_CURRENT_TAB_AUTO,
  FOCUS_MODE_CURRENT_TAB_ALWAYS,
  EXTENSION_UPDATED_AT
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

import moment from 'moment';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

class AudioFocus {
  constructor() {
    this.browserAction = new BrowserAction(BROWSER_ACTION_STATE_ICONS)
    this.tabManager = new TabManager()
    this.active = true
    this.preferences = undefined
  }

  async init() {
    const self = this
    chrome.runtime.onInstalled.addListener(async (details) => {
      const ON_INSTALLED_REASON_INSTALL = 'install'
      const ON_INSTALLED_REASON_UPDATE = 'update'
      if (details.reason === ON_INSTALLED_REASON_INSTALL) {
        const tabs = await self.tabManager.getTabs({
          url: ["http://*/*", "https://*/*"]
        })
        /* 
         * when installed, the app won't execute conetent scripts automatically, thus, they must be added manually  
         */
        self.tabManager.executeContentScripts(tabs)
        self.tabManager.openPage('intro/intro.html')
      } else if (details.reason === ON_INSTALLED_REASON_UPDATE) {
        chrome.storage.sync.set({
          [EXTENSION_UPDATED_AT]: moment().format('YYYY-MM-DD HH:mm:ss')
        })
        self.browserAction.setBadge('New', '#f00')
      }
    })

    chrome.storage.sync.get([EXTENSION_UPDATED_AT], function (result) {
      const updated_at = result[EXTENSION_UPDATED_AT] ? result[EXTENSION_UPDATED_AT] : '2019-07-12 00:00:00'
      const twoWeeksAgo = moment().subtract(1, 'weeks')

      if (twoWeeksAgo.isAfter(moment(updated_at, 'YYYY-MM-DD HH:mm:ss'))) {
        self.browserAction.setBadge('', '#000')
      }
    })

    chrome.storage.sync.onChanged.addListener(function (changes, namespace) {
      if (changes[USER_PREFERENCES]) {
        self.preferences = changes[USER_PREFERENCES].newValue
        if (self.active) {
          self.activate()
        }
      }
    })

    chrome.storage.sync.get([EXTENSION_ACTIVE, USER_PREFERENCES], async function (result) {
      if (!result[EXTENSION_ACTIVE] || !result[USER_PREFERENCES]) {
        chrome.storage.sync.set(AUDIO_FOCUS_SCHEMA, function () {
          self.active = AUDIO_FOCUS_SCHEMA[EXTENSION_ACTIVE]
          self.preferences = AUDIO_FOCUS_SCHEMA[USER_PREFERENCES]
          self.initialize(self.active, self.preferences)
        })
      } else {
        self.active = result[EXTENSION_ACTIVE]
        self.preferences = result[USER_PREFERENCES]
        self.initialize(self.active, self.preferences)
      }
    })
  }

  async initialize(active, preferences) {
    const self = this
    await self.browserAction.setState(active ? BROWSER_ACTION_STATE_ON : BROWSER_ACTION_STATE_OFF)
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
      chrome.windows.getCurrent(null, function (window) {
        const isActiveTabOnCurrentWindow = activeTab.windowId === window.id
        if (isActiveTabOnCurrentWindow && self.active && activeTab.url) {
          switch (self.preferences[FOCUS_MODE]) {
            case FOCUS_MODE_CURRENT_TAB_AUTO:
              if (activeTab.audible) {
                self.clearActiveTab(activeTab.id)
                self.blurInactiveTabs(activeTab.id)
              } else {
                self.blurActiveTab(activeTab.id) /* Do we need to blur active tab? */
                self.clearInactiveTabs(activeTab.id)
              }
              break
            case FOCUS_MODE_CURRENT_TAB_ALWAYS:
              self.clearActiveTab(activeTab.id)
              self.blurInactiveTabs(activeTab.id)
              break
          }
        }
      })
    })

    self.tabManager.addOnUpdatedListener(async function (tabId, changeInfo, tab) {
      if (self.active && tab.url && tab.active) {
        switch (self.preferences[FOCUS_MODE]) {
          case FOCUS_MODE_CURRENT_TAB_AUTO:
            if (tab.audible) {
              self.clearActiveTab(tab.id)
              self.blurInactiveTabs(tab.id)
            } else {
              self.blurActiveTab(tab.id) /* Do we need to blur active tab? */
              self.clearInactiveTabs(tab.id)
            }
            break
          case FOCUS_MODE_CURRENT_TAB_ALWAYS:
            self.clearActiveTab(tab.id)
            self.blurInactiveTabs(tab.id)
            break
        }
      }
    })

    if (self.active) {
      self.activate()
    } else {
      self.deactivate()
    }
  }

  async activate() {
    const activeTab = await this.tabManager.getActiveTab()
    let self = this
    chrome.storage.sync.set({
      [EXTENSION_ACTIVE]: true
    }, function () {
      self.browserAction.setState(BROWSER_ACTION_STATE_ON)
      switch (self.preferences[FOCUS_MODE]) {
        case FOCUS_MODE_CURRENT_TAB_AUTO:
          if (activeTab.audible) {
            self.blurInactiveTabs(activeTab.id)
          } else {
            self.clearInactiveTabs(activeTab.id)
          }
          break
        case FOCUS_MODE_CURRENT_TAB_ALWAYS:
          self.blurInactiveTabs(activeTab.id)
          break
      }
      self.active = true
    })
  }

  async deactivate() {
    let self = this
    chrome.storage.sync.set({
      [EXTENSION_ACTIVE]: true
    }, function () {
      self.clearAllTabs()
      self.browserAction.setState(BROWSER_ACTION_STATE_OFF)
      self.active = false
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