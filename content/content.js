class ChromeMessageHandler {
  constructor(onMessageReceived) {
    chrome.runtime.onMessage.addListener(onMessageReceived)
  }
}

class ContentMessageHandler {
  constructor(chromeMessageHandler, pageMessageHandler) {
    this.chromeMessageHandler = chromeMessageHandler
    this.pageMessageHandler = pageMessageHandler
  }
}

function sendMessageToWindow(message, window) {
  const broadcastEvent = new CustomEvent(message.what);
  window.dispatchEvent(broadcastEvent)
}

const chromeMessageHandler = new ChromeMessageHandler(function(message, sender, sendResponse) {
  sendMessageToWindow(message, window)
})

new ContentMessageHandler (
  chromeMessageHandler
)

window.addEventListener('af-page-media-playing', function(event) {
  console.log(`content.js >> event: ${JSON.stringify(event)}`)
  chrome.runtime.sendMessage({
    what: 'af-page-media-playing'
  })
})

window.addEventListener('af-page-media-stopped', function(event) {
  console.log(`content.js >> event: ${JSON.stringify(event)}`)
  chrome.runtime.sendMessage({
    what: 'af-page-media-stopped'
  })
})

window.addEventListener('af-page-init', function(event) {
  chrome.runtime.sendMessage({
    what: 'af-page-init'
  }, function(response) {
    console.log(`content.js >> af-page-init >> response ${JSON.stringify(response)}`);
    const options = response.options
    if (!options || !options.focus) {
      return
    }
    
    switch (options.focus) {
      case 'always-focus':
        console.log(`content.js >> af-page-init >> response >> always-focus`);
        const broadcastEvent = new CustomEvent('af_tab_init_options_always_focus');
        window.dispatchEvent(broadcastEvent)
        break
      case 'focus-playing-media':
        console.log(`content.js >> af-page-init >> response >> focus-playing-media`);
        const broadcastEvent2 = new CustomEvent('af_tab_init_options_focus_playing_media');
        window.dispatchEvent(broadcastEvent2)
        break
    }
  })
})

var scriptElement = document.createElement('script')
scriptElement.src = chrome.extension.getURL('content/page.js')
document.head.appendChild(scriptElement);
scriptElement.onload = function() {
  scriptElement.remove();
}