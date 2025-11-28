import { ConsoleState } from '../../utils/ConsoleConsts';

// keyboard keys that need to press&hold the shiftKey
export const isShiftKeyRequired = (char: string): boolean =>
  !!char?.match(/[A-Z~!@#$%^&*()_+}{|\":?><]/);

export const LINE_FEED = 10;
export const HORIZONTAL_TAB = 9;

export const LATIN_1_FIRST_CHAR = 0x20;
export const LATIN_1_LAST_CHAR = 0xff;

const VNC_IN_USE_ERROR_TEXT = 'Active VNC connection. Request denied.';

export const isSessionAlreadyInUse = (error: Error): boolean => {
  return error?.message?.includes?.(VNC_IN_USE_ERROR_TEXT) ?? false;
};

export const isConnectableState = (state: ConsoleState) =>
  [
    ConsoleState.connecting,
    ConsoleState.disconnected,
    ConsoleState.session_already_in_use,
  ].includes(state);
