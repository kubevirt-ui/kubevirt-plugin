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
export const HORIZONTAL_TAB = 9;
export const LATIN_1_FIRST_CHAR = 0x20;
export const LATIN_1_LAST_CHAR = 0xff;

export const CONTROL_L = 'ControlLeft';
export const ALT_L = 'AltLeft';
export const ONE = 'One';
export const TWO = 'Two';
export const SCAN_CODE_NAMES = [ALT_L, CONTROL_L, ONE, TWO] as const;

export const VNC_IN_USE_ERROR_TEXT = 'Active VNC connection. Request denied.';

export const ALL_SESSIONS = -1;
