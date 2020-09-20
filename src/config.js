'use strict';

import {
  BROWSER_ACTION_STATE_OFF,
  BROWSER_ACTION_STATE_ON
} from './chrome-extension/browser-action';

export const BROWSER_ACTION_STATE_ICONS = {
  [BROWSER_ACTION_STATE_OFF]: 'icons/icon_browser_action_inactive_128x128.png',
  [BROWSER_ACTION_STATE_ON]: 'icons/icon_browser_action_active_128x128.png'
}

export const EXTENSION_UPDATED_AT = 'extension_updated_at'
export const EXTENSION_ACTIVE = 'extension_active'
export const USER_PREFERENCES = 'user_preferences'

export const FOCUS_MODE = 'focus_mode'
export const FOCUS_MODE_CURRENT_TAB_ALWAYS = 'focus_mode_current_tab_always'
export const FOCUS_MODE_CURRENT_TAB_AUTO = 'focus_mode_current_tab_auto'

export const AUDIO_FOCUS_SCHEMA = {
  [EXTENSION_ACTIVE]: true,
  [USER_PREFERENCES]: {
    [FOCUS_MODE]: FOCUS_MODE_CURRENT_TAB_AUTO
  }
}