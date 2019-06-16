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
    case "UPDATE":
    let updateEvent = new CustomEvent('UPDATE')
    window.dispatchEvent(updateEvent)
    default:
  }
})

//  event.data points a message object from a page script
window.addEventListener('message', function(event) {
  
})
