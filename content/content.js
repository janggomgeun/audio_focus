chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var broadcastEvent
  console.log('content.js::' + message.what)
  switch (message.what) {
    case "af_focus":
    broadcastEvent = new CustomEvent('af_focus')
    window.dispatchEvent(broadcastEvent)
    break

    case "af_focusout":
    broadcastEvent = new CustomEvent('af_focusout')
    window.dispatchEvent(broadcastEvent)
    break

    case "af_update":
    broadcastEvent = new CustomEvent('af_update')
    window.dispatchEvent(broadcastEvent)
    break

    case "af_back":
    broadcastEvent = new CustomEvent('af_back')
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
