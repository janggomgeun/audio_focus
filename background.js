/* API Documentation
 * https://developers.chrome.com/extensions/api_index
 */

 class AudioFocus {
   constructor() {
     this.active = false
     this.activeTabId = -1
     this.onFocus = false

     let self = this
     chrome.runtime.onInstalled.addListener(function(details) {})
     chrome.browserAction.setBadgeText({text:"OFF"})
     chrome.browserAction.setBadgeBackgroundColor({color:"#ff4040"})

     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       console.log('active tab id is initialized with the value ' + tabs[0].id);
       self.activeTabId = tabs[0].id
     })

     chrome.browserAction.onClicked.addListener(function(tab) {
       console.log('browser action clicked')
       self.active = !self.active
       setActive(self.active)
     })

     chrome.tabs.onActivated.addListener(function(activeInfo) {
       console.log('active tab has just changed to the ' + activeInfo.tabId);
       self.activeTabId = activeInfo.tabId
       if (self.active) {
         console.log('active tab id is ' + self.activeTabId);
         self.focus(self.activeTabId)
       }
     })

     chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
       if (changeInfo.url) {
         chrome.tabs.sendMessage(tabId, {
           what: "update"
         })
       }
     })

     chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
       if (tabId === self.activeTabId) {
         self.back()
       }
     })
   }

   setActive(active) {
     if (active) {
       focus(this.activeTabId)
     } else {
       back()
     }
   }

   focus(tabId) {
     console.log('This extension will focus on the tab with the id ' + tabId)
     let self = this
     chrome.tabs.query({url: ["http://*/*", "https://*/*"]}, function(tabs) {
       for (var i=0; i<tabs.length; ++i) {
         if (tabs[i].id === tabId) {
           chrome.tabs.sendMessage(tabs[i].id, {
             what: "focus"
           })
         } else {
           chrome.tabs.sendMessage(tabs[i].id, {
             what: "focusout"
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
           what: "back"
         });
       }
       self.onFocus = false
     });
   }
 }

 new AudioFocus()
