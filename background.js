chrome.runtime.onInstalled.addListener(function(details) {
  chrome.browserAction.setBadgeText({text:"OFF"})
  chrome.browserAction.setBadgeBackgroundColor({color:"#ff4040"})
  // chrome.tabs.create({url: "intro.html"})
})

chrome.runtime.onConnect.addListener(function(port) {

})

chrome.tabs.onActivated.addListener(function(activeInfo) {
  var tabId = activeInfo.tabId
  console.log(activeInfo);
})
