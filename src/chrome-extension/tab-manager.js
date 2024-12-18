export default class TabManager {
    constructor() {
        this.tabs = null
    }

    async openPage(url) {
        const properties = {
            url,
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

    async getTabById(tabId) {
        return new Promise((resolve, reject) => {
            chrome.tabs.get(tabId, function (tab) {
                resolve(tab)
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
        for (const tab of tabs) {
            await self.executeContentScript(tab)
        }
    }

    async executeContentScript(tab) {
        return new Promise(function (resolve, reject) {
            chrome.tabs.executeScript(tab.id, {
                file: "contentScript.js"
            }, function () {
                resolve()
            })
        })
    }

    async sendMessageToTabById(tabId, message) {
        return new Promise(function (resolve, reject) {
            chrome.tabs.sendMessage(tabId, message, function (response) {
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