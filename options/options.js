const optionsFocus = document.getElementsByName('options-focus')
chrome.storage.sync.get(['options'], function(result) {
    for (const option of optionsFocus) {
        if (result['options'].focus && result['options'].focus === option.value) {
            option.checked = true
        }
    }    
});

for (const option of optionsFocus) {
    option.addEventListener('change', function(e) {
        chrome.storage.sync.set({
            options : {
                focus: e.target.value
            }
        })
    })
}
