const optionsFocus = document.getElementsByName('options-focus')
for (const option of optionsFocus) {
    option.addEventListener('change', function(e) {
        chrome.storage.sync.set({
            optionsFocus: e.target.value
        })
    })  
}