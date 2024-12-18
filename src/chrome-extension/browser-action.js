export const BROWSER_ACTION_STATE_OFF = "browser_action_state_off";
export const BROWSER_ACTION_STATE_ON = "browser_action_state_on";

export class BrowserAction {

  constructor(iconsByState, options) {
    this.iconsByState = iconsByState
    this.state = undefined
  }

  async setIcon(details) {
    return new Promise(function (resolve, reject) {
      chrome.browserAction.setIcon(details, function () {
        resolve()
      })
    })
  }

  async setBadge(text, backgroundColor) {
    return new Promise(function (resolve, reject) {
      chrome.browserAction.setBadgeText({
        text
      })
      chrome.browserAction.setBadgeBackgroundColor({
        color: backgroundColor
      })
      resolve()
    })
  }

  async setState(state) {
    this.state = state
    await this.setIcon({
      path: this.iconsByState[this.state]
    })
  }

  addOnClickListener(onClicked) {
    chrome.browserAction.onClicked.addListener(onClicked)
  }
}