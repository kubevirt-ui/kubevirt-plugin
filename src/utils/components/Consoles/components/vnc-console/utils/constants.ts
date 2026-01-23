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
export const KUBEVIRT_UI_VNC_AUTOCONNECT_LABEL = 'kubevirt-ui/vnc-autoconnect';

export const KEYBOARD_DELAY = 50;
export const LINE_FEED = 10;

export const CONTROL_L = 'ControlLeft';
export const ALT_L = 'AltLeft';
export const ONE = 'One';
export const TWO = 'Two';
export const F1 = 'F1';
export const F2 = 'F2';
export const F3 = 'F3';
export const F4 = 'F4';
export const F5 = 'F5';
export const F6 = 'F6';
export const F7 = 'F7';
export const F8 = 'F8';
export const F9 = 'F9';
export const F10 = 'F10';
export const F11 = 'F11';
export const F12 = 'F12';
export const SCAN_CODE_NAMES = [
  ALT_L,
  CONTROL_L,
  ONE,
  TWO,
  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
  F11,
  F12,
] as const;

export const VNC_IN_USE_ERROR_TEXT = 'Active VNC connection. Request denied.';

export const ALL_SESSIONS = -1;
