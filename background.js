/* API Documentation
 * https://developers.chrome.com/extensions/api_index
 */
class AudioFocus {
 constructor() {
   this.active = false
   this.activeTabId = -1
   this.onFocus = false
   this.options = {
     focusTab: {},
     otherTabs: {}
   }

   let self = this
   chrome.runtime.onInstalled.addListener(function(details) {
     chrome.tabs.query({url: ["http://*/*", "https://*/*"]}, function(tabs) {
       for (var i=0; i<tabs.length; ++i) {
         chrome.tabs.executeScript(tabs[i].id, {
           file: "content/content.js"
         })
       }
     })

     chrome.tabs.create({
       url: "options/options.html",
       active: true
     })
   })
   chrome.browserAction.setIcon({
     path: "icons/icon_browser_action_inactive_128x128.png"
   })

   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     self.activeTabId = tabs[0].id
   })

   chrome.browserAction.onClicked.addListener(function(tab) {
     self.active = !self.active
     if (self.active) {
       self.focus(self.activeTabId)
       chrome.browserAction.setIcon({
         path: "icons/icon_browser_action_active_128x128.png"
       })
     } else {
       self.back()
       chrome.browserAction.setIcon({
         path: "icons/icon_browser_action_inactive_128x128.png"
       })
     }
   })

   chrome.tabs.onActivated.addListener(function(activeInfo) {
     self.activeTabId = activeInfo.tabId
     if (self.active) {
       self.focus(self.activeTabId)
     }
   })

   chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
     if (changeInfo.url) {
       chrome.tabs.sendMessage(tabId, {
         what: "af_update"
       })
     }
   })

   chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
     if (tabId === self.activeTabId) {
       self.back()
     }
   })

   chrome.commands.onCommand.addListener(function(command) {
     switch (command) {
       case "toggle-audiofocus":
         self.active = !self.active
         if (self.active) {
           self.focus(self.activeTabId)
           chrome.browserAction.setIcon({
             path: "icons/icon_browser_action_active_128x128.png"
           })
         } else {
           self.back()
           chrome.browserAction.setIcon({
             path: "icons/icon_browser_action_inactive_128x128.png"
           })
         }
         break;
       default:

     }
   })
 }

 focus(tabId) {
   let self = this
   chrome.tabs.query({url: ["http://*/*", "https://*/*"]}, function(tabs) {
     for (var i=0; i<tabs.length; ++i) {
       if (tabs[i].id === tabId) {
         chrome.tabs.sendMessage(tabs[i].id, {
           what: "af_focus"
         })
       } else {
         chrome.tabs.sendMessage(tabs[i].id, {
           what: "af_focusout"
         })
       }
     }
     self.onFocus = true
   })
 }

 back() {
   let self = this
   chrome.tabs.query({}, function(tabs) {
     for (var i=0; i<tabs.length; ++i) {
       chrome.tabs.sendMessage(tabs[i].id, {
         what: "af_back"
       });
     }
     self.onFocus = false
   });
 }
}
new AudioFocus()
