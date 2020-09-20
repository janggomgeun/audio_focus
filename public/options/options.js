const USER_PREFERENCES = 'user_preferences'
const FOCUS_MODE = 'focus_mode'

let preferences = undefined
let isLoaded = false
let currentMode = undefined

async function loadPreferences() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([USER_PREFERENCES], function (result) {
      preferences = result[USER_PREFERENCES]
      currentMode = preferences[FOCUS_MODE]
      resolve()
    })
  })
}

async function savePreferences() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(preferences, function () {
      resolve()
    })
  })
}

function updatePreferencesView() {
  modes.forEach((mode) => {
    if (mode.value === currentMode) {
      mode.checked = true
    } else {
      mode.checked = false
    }
  })
}

const modes = document.querySelectorAll('input[name="mode"]')
modes.forEach((mode) => {
  mode.addEventListener('change', function () {
    currentMode = this.value
    chrome.storage.sync.set({
      [USER_PREFERENCES]: {
        [FOCUS_MODE]: currentMode
      }
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