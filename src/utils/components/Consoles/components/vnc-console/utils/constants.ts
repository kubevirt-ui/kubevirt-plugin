export const USER_CONNECT = 'user_connect';
export const AUTO_CONNECT = 'auto_connect';
// follow the levels used by noVNC
// falsy value means no logging
// https://github.com/novnc/noVNC/blob/6d0a9746657b085c11309dc5356083fcbb018526/core/util/logging.js#L32
export const DEBUG = 'debug';
export const INFO = 'info';
export const WARN = 'warn';
export const ERROR = 'error';
export const VNC_LOG_LEVELS = [DEBUG, INFO, WARN, ERROR] as const;

export const KUBEVIRT_UI_VNC_LOG_LEVEL_LABEL = 'kubevirt-ui/vnc-log-level';

export const KEYBOARD_DELAY = 50;
export const LINE_FEED = 10;

export const CONTROL_L = 'ControlLeft';
export const ALT_L = 'AltLeft';
export const ONE = 'One';
export const TWO = 'Two';
export const KEY_F1 = 'F1';
export const KEY_F2 = 'F2';
export const KEY_F3 = 'F3';
export const KEY_F4 = 'F4';
export const KEY_F5 = 'F5';
export const KEY_F6 = 'F6';
export const KEY_F7 = 'F7';
export const KEY_F8 = 'F8';
export const KEY_F9 = 'F9';
export const F10 = 'F10';
export const F11 = 'F11';
export const F12 = 'F12';
export const SCAN_CODE_NAMES = [
  ALT_L,
  CONTROL_L,
  ONE,
  TWO,
  KEY_F1,
  KEY_F2,
  KEY_F3,
  KEY_F4,
  KEY_F5,
  KEY_F6,
  KEY_F7,
  KEY_F8,
  KEY_F9,
  F10,
  F11,
  F12,
] as const;

export const VNC_IN_USE_ERROR_TEXT = 'Active VNC connection. Request denied.';

export const ALL_SESSIONS = -1;
