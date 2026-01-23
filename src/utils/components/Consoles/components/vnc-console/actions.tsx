import KeyTable from '@novnc/novnc/lib/input/keysym';

import { readFromClipboard } from '../../utils/utils';
import { PasteParams } from '../AccessConsoles/utils/accessConsoles';

import {
  ALT_L,
  CONTROL_L,
  HORIZONTAL_TAB,
  LATIN_1_FIRST_CHAR,
  LATIN_1_LAST_CHAR,
  LINE_FEED,
  ONE,
  TWO,
} from './utils/constants';
import { isShiftKeyRequired, typeAndWait } from './utils/util';
import { RFB, ScanCodeName } from './utils/VncConsoleTypes';

const canExecuteCommands = (rfb: RFB): boolean =>
  rfb._rfbConnectionState === 'connected' && !rfb._viewOnly;

// eslint-disable-next-line require-jsdoc
function sendCtrlAltPlusKey(rfb: RFB, keysym: number, code: ScanCodeName): void {
  if (!canExecuteCommands(rfb)) {
    return;
  }
  rfb.sendKey(KeyTable.XK_Control_L, CONTROL_L, true);
  rfb.sendKey(KeyTable.XK_Alt_L, ALT_L, true);
  rfb.sendKey(keysym, code, true);
  rfb.sendKey(keysym, code, false);
  rfb.sendKey(KeyTable.XK_Alt_L, ALT_L, false);
  rfb.sendKey(KeyTable.XK_Control_L, CONTROL_L, false);
}

// eslint-disable-next-line require-jsdoc
export function sendCtrlAlt1() {
  sendCtrlAltPlusKey(this, KeyTable.XK_1, ONE);
}

// eslint-disable-next-line require-jsdoc
export function sendCtrlAlt2() {
  sendCtrlAltPlusKey(this, KeyTable.XK_2, TWO);
}

/**
 * Type in char-by-char text retrieved from clipboard.
 * @param params
 * @returns void
 */
export async function sendPasteCMD(params?: PasteParams) {
  const { shouldFocusOnConsole = true } = params ?? {};

  if (!canExecuteCommands(this)) {
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
      await typeAndWait(this, KeyTable.XK_Return, true);
      await typeAndWait(this, KeyTable.XK_Return, false);
    } else if (codePointIndex === HORIZONTAL_TAB) {
      await typeAndWait(this, KeyTable.XK_Tab, true);
      await typeAndWait(this, KeyTable.XK_Tab, false);
    } else if (codePointIndex >= LATIN_1_FIRST_CHAR && codePointIndex <= LATIN_1_LAST_CHAR) {
      // qemu maintains virtual keyboard state (caps lock, shift, etc)
      // keysyms are checked against that state and lower case version will be picked
      // if there is no shift/caps lock turn on
      const shiftRequired = isShiftKeyRequired(codePoint);
      // shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', true);
      if (shiftRequired) {
        await typeAndWait(this, KeyTable.XK_Shift_L, true);
      }
      // Latin-1 set that maps directly to keysym
      await typeAndWait(this, codePointIndex, true);
      await typeAndWait(this, codePointIndex, false);

      if (shiftRequired) {
        await typeAndWait(this, KeyTable.XK_Shift_L, false);
      }
    }
    if (!canExecuteCommands(this)) {
      // the connection might have been interrupted in the meantime
      return;
    }
  }

  if (shouldFocusOnConsole) {
    this.focus();
  }
}
