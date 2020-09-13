function injectPageScript(document, path) {
  var scriptElement = document.createElement('script')
  scriptElement.src = chrome.extension.getURL(path)
  document.head.appendChild(scriptElement);
  scriptElement.onload = function () {
    scriptElement.remove();
  }
}

function sendMessageToWindow(message, window) {
  const broadcastEvent = new CustomEvent(message.what);
  window.dispatchEvent(broadcastEvent)
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  sendMessageToWindow(message, window)
})

injectPageScript(document, 'content/page.js')