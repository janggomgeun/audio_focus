'use strict';

import {
  BROWSER_ACTION_STATE_OFF,
  BROWSER_ACTION_STATE_ON
} from './chrome-extension/browser-action';

export const BROWSER_ACTION_STATE_ICONS = {
  [BROWSER_ACTION_STATE_OFF]: 'icons/icon_browser_action_inactive_128x128.png',
  [BROWSER_ACTION_STATE_ON]: 'icons/icon_browser_action_active_128x128.png'
}

export const EXTENSION_ACTIVE = 'extension_active'