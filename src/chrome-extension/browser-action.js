export const BROWSER_ACTION_STATE = "browser_action_state";
export const BROWSER_ACTION_STATE_OFF = "browser_action_state_off";
export const BROWSER_ACTION_STATE_ON = "browser_action_state_on";

export class BrowserAction {

    constructor(iconsByState, options) {
      this.iconsByState = {
        [BROWSER_ACTION_STATE_OFF]: iconsByState[BROWSER_ACTION_STATE_OFF],
        [BROWSER_ACTION_STATE_ON]: iconsByState[BROWSER_ACTION_STATE_ON]
      }
      this.state = undefined
    }
  
    async setIcon(details) {
      return new Promise(function (resolve, reject) {
        chrome.browserAction.setIcon(details, function () {
          resolve()
        })
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