chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var broadcastEvent
  console.log('content.js::' + message.what)
  switch (message.what) {
    case "focus":
    broadcastEvent = new CustomEvent('focus')
    window.dispatchEvent(broadcastEvent)
    break

    case "focusout":
    broadcastEvent = new CustomEvent('focusout')
    window.dispatchEvent(broadcastEvent)
    break

    case "update":
    broadcastEvent = new CustomEvent('update')
    window.dispatchEvent(broadcastEvent)
    break

    case "back":
    broadcastEvent = new CustomEvent('return')
    window.dispatchEvent(broadcastEvent)
    break

    default:
    break
  }
})

var scriptElement = document.createElement('script')
scriptElement.src = chrome.extension.getURL('content/page.js')
document.head.appendChild(scriptElement);
  scriptElement.onload = function() {
  scriptElement.remove();
};
