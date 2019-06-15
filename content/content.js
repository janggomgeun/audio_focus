var contentPort = chrome.runtime.connect({name: "CONTENT"})

var scriptElement = document.createElement('script')
scriptElement.src = chrome.extension.getURL('content/page.js')
document.head.appendChild(scriptElement);
  scriptElement.onload = function() {
  scriptElement.remove();
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.what) {
    case "ENABLE":
    let enableEvent = new CustomEvent('ENABLE')
    window.dispatchEvent(enableEvent)
      break;
    default:
  }
})

window.addEventListener('message', function(event) {})
