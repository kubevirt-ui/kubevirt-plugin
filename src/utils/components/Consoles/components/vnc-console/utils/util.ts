import { sleep } from '@kubevirt-utils/components/Consoles/utils/utils';
import RFBCreate from '@novnc/novnc/lib/rfb';

import { ConsoleState } from '../../utils/ConsoleConsts';

import { RFB } from './VncConsoleTypes';

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
export type ScanCodeName = (typeof SCAN_CODE_NAMES)[number];

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

/**
 * Add delay to QEMUExtendedKeyEvent
 * @param rfb to be used as 'this'
 * @param keysym keysym - see @novnc/novnc/lib/input/keysym
 * @param pressed
 * @param down true if the key was pressed
 * @param scanCode scanCode - see @novnc/novnc/lib/input/xtscancodes
 */
export async function typeAndWait(
  rfb: RFB,
  keysym: number,
  down: boolean,
  scanCode: number,
): Promise<void> {
  RFBCreate.messages.QEMUExtendedKeyEvent(rfb._sock, keysym, down, scanCode);
  // long text is getting truncated without a delay
  await sleep(KEYBOARD_DELAY);
}

// Example: 10 -> "U+000A"
export const toUnicodeFormat = (codePoint: number): string =>
  `U+${codePoint.toString(16).padStart(4, '0').toUpperCase()}`;
