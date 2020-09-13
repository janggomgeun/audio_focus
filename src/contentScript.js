'use strict';

import { injectPageScript } from './web/util';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

function sendMessageToWindow(message, window) {
  const broadcastEvent = new CustomEvent(message.what);
  window.dispatchEvent(broadcastEvent)
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  sendMessageToWindow(message, window)
})

injectPageScript(document, 'pageScript.js')

window.addEventListener('message', function(event) {
  if (event.source != window) {
    return;
  }

  if (event.data.type && (event.data.type == 'FROM_PAGE')) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(event.data.text);
  }
}, false)