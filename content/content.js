var port = chrome.runtime.connect({name: "CONTENT"})
port.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.what) {
    case "enable":
      let enableEvent = new CustomEvent('enable')
      window.dispatchEvent(enableEvent)
    break;

    case "focuschanged":
      let updateEvent = new CustomEvent('focuschanged')
      window.dispatchEvent(updateEvent)

    default:
    break;
  }
})

//  event.data points a message object from a page script
window.addEventListener('message', function(event) {
  port.sendMessage(event.data)
})

var scriptElement = document.createElement('script')
scriptElement.src = chrome.extension.getURL('content/page.js')
document.head.appendChild(scriptElement);
  scriptElement.onload = function() {
  scriptElement.remove();
};
