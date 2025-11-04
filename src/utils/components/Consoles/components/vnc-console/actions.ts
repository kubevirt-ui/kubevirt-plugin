/* eslint-disable require-jsdoc */
import KeyTable from '@novnc/novnc/lib/input/keysym';

import { readFromClipboard, sleep } from '../../utils/utils';

import {
  HORIZONTAL_TAB,
  isShiftKeyRequired,
  LATIN_1_FIRST_CHAR,
  LATIN_1_LAST_CHAR,
  LINE_FEED,
} from './utils/util';

export function sendCtrlAlt1() {
  if (this._rfbConnectionState !== 'connected' || this._viewOnly) {
    return;
  }
  this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true);
  this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true);
  this.sendKey(KeyTable.XK_1, 'One', true);
  this.sendKey(KeyTable.XK_1, 'One', false);
  this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false);
  this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false);
}

export function sendCtrlAlt2() {
  if (this._rfbConnectionState !== 'connected' || this._viewOnly) {
    return;
  }
  this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true);
  this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true);
  this.sendKey(KeyTable.XK_2, 'Two', true);
  this.sendKey(KeyTable.XK_2, 'Two', false);
  this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false);
  this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false);
}

export async function sendPasteCMD(shouldFocusOnConsole?: boolean) {
  if (this._rfbConnectionState !== 'connected' || this._viewOnly) {
    return;
  }
  const clipboardText = await readFromClipboard();
  if (typeof clipboardText !== 'string') {
    return;
  }
  const text = clipboardText;
  for (const codePoint of text) {
    const codePointIndex = codePoint.codePointAt(0);
    if (codePointIndex === LINE_FEED) {
      this.sendKey(KeyTable.XK_Return);
    } else if (codePointIndex === HORIZONTAL_TAB) {
      this.sendKey(KeyTable.XK_Tab);
    } else if (codePointIndex >= LATIN_1_FIRST_CHAR && codePointIndex <= LATIN_1_LAST_CHAR) {
      // qemu maintains virtual keyboard state (caps lock, shift, etc)
      // keysyms are checked against that state and lower case version will be picked
      // if there is no shift/caps lock turn on
      const shiftRequired = isShiftKeyRequired(codePoint);
      shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', true);
      // long text is getting truncated without a delay
      await sleep(50);
      // Latin-1 set that maps directly to keysym
      this.sendKey(codePointIndex);
      shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', false);
    }
  }
  if (shouldFocusOnConsole) {
    this.focus();
  }
}

function createSendKeyFunction(keyTable: number, keyCode: string) {
  return function () {
    if (this._rfbConnectionState !== 'connected' || this._viewOnly) {
      return;
    }
    this.sendKey(keyTable, keyCode, true);
    this.sendKey(keyTable, keyCode, false);
  };
}

export const sendF1 = createSendKeyFunction(KeyTable.XK_F1, 'F1');
export const sendF2 = createSendKeyFunction(KeyTable.XK_F2, 'F2');
export const sendF3 = createSendKeyFunction(KeyTable.XK_F3, 'F3');
export const sendF4 = createSendKeyFunction(KeyTable.XK_F4, 'F4');
export const sendF5 = createSendKeyFunction(KeyTable.XK_F5, 'F5');
export const sendF6 = createSendKeyFunction(KeyTable.XK_F6, 'F6');
export const sendF7 = createSendKeyFunction(KeyTable.XK_F7, 'F7');
export const sendF8 = createSendKeyFunction(KeyTable.XK_F8, 'F8');
export const sendF9 = createSendKeyFunction(KeyTable.XK_F9, 'F9');
export const sendF10 = createSendKeyFunction(KeyTable.XK_F10, 'F10');
export const sendF11 = createSendKeyFunction(KeyTable.XK_F11, 'F11');
export const sendF12 = createSendKeyFunction(KeyTable.XK_F12, 'F12');
