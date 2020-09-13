export default class BrowserAction {
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