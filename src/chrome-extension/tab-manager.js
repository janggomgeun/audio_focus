export default class TabManager {
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