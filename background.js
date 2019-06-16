chrome.runtime.onInstalled.addListener(function(details) {
  chrome.browserAction.setBadgeText({text:"OFF"})
  chrome.browserAction.setBadgeBackgroundColor({color:"#ff4040"})
  // chrome.tabs.create({url: "intro.html"})
})

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('browser action is clicked')
})

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {

  })
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.tabs.sendMessage(tabId, {
    what: "focuschanged"
  })
})
chrome.tabs.onActivated.addListener(function(activeInfo) {})
