const USER_PREFERENCES = 'user_preferences'
const FOCUS_MODE = 'focus_mode'

let preferences = undefined
let isLoaded = false
let currentMode = undefined

async function loadPreferences() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([USER_PREFERENCES], function (result) {
      preferences = result[USER_PREFERENCES]
      console.log(`preferences: ${preferences}`)
      resolve()
    })
  })
}

async function savePreferences() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(preferences, function () {
      console.log('saved')
      resolve()
    })
  })
}

function updatePreferencesView() {
  console.log('updatePreferencesView');
}

const modes = document.querySelectorAll('input[name="mode"]')
modes.forEach((mode) => {
  mode.addEventListener('change', function () {
    currentMode = this.value
    console.log(`currentMode: ${currentMode}`)
    chrome.storage.sync.set({
      [USER_PREFERENCES]: {
        [FOCUS_MODE]: currentMode
      }
    }, function () {
      console.log('saved');
    })
  })
})

chrome.storage.sync.onChanged.addListener(function (changes, namespace) {
  if (!isLoaded) {
    return
  }
  updatePreferencesView()
})

loadPreferences().then(async () => {
  isLoaded = true
  updatePreferencesView()
})