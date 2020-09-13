export function injectPageScript(document, path) {
    console.log('injectPageScript');
    var scriptElement = document.createElement('script')
    scriptElement.src = chrome.extension.getURL(path)
    console.log(`src: ${scriptElement.src}`);
    document.head.appendChild(scriptElement);
    scriptElement.onload = function () {
        scriptElement.remove();
    }
}
