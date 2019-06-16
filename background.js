/* API Documentation
 * https://developers.chrome.com/extensions/api_index
 */

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.browserAction.setBadgeText({text:"OFF"})
  chrome.browserAction.setBadgeBackgroundColor({color:"#ff4040"})
})

/*
 * Status of tabs can be as following
 */

var onFocus = false
function focus(tabId) {
  chrome.tabs.query({}, function(tabs) {
    for (var i=0; i<tabs.length; ++i) {
      if (tabs[i].id === tabId) {
        chrome.tabs.sendMessage(tabs[i].id, {
          what: "focus"
        });
      } else {
        chrome.tabs.sendMessage(tabs[i].id, {
          what: "focusout"
        });
      }
    }
    onFocus = true
  });
}

function back() {
  chrome.tabs.query({}, function(tabs) {
    for (var i=0; i<tabs.length; ++i) {
      chrome.tabs.sendMessage(tabs[i].id, {
        what: "back"
      });
    }
    onFocus = false
  });
}

var active = false
function setActive(active) {
  if (active) {
    focus(activeTabId)
  } else {
    back()
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log('browser action clicked');
  active = !active
  setActive(active)
})

var activeTabId
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  console.log('active tab id is initialized with the value ' + tabs[0].id);
  activeTabId = tabs[0].id
})

chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('active tab has just changed to the ' + activeInfo.tabId);
  activeTabId = activeInfo.tabId
  if (active) {
    focus(activeTabId)
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
  if (tabId === activeTabId) {
    back()
  }
})
