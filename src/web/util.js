export function injectPageScript(document, path) {
    var scriptElement = document.createElement('script')
    scriptElement.src = chrome.extension.getURL(path)
    document.head.appendChild(scriptElement);
    scriptElement.onload = function () {
        scriptElement.remove();
    }
}
