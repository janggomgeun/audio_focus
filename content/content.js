chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var broadcastEvent
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

    case "af_test":
      console.log('af_test');
      break

    default:
    break
  }
})

window.addEventListener('message', function(event) {
  console.log(JSON.stringify(event));
  if (event.source !== window) {
    return;
  }

  let message = event.data;

  if (typeof message !== 'object' || message === null || !message.hello) {
    return;
  }

  console.log('test succeed');
})

var scriptElement = document.createElement('script')
scriptElement.src = chrome.extension.getURL('content/page.js')
document.head.appendChild(scriptElement);
scriptElement.onload = function() {
  scriptElement.remove();
};
