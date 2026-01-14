import React from 'react';

import {
  CharMappingWithModifiers,
  KeyMapDef,
  keyMaps,
  resolveCharMapping,
} from '@kubevirt-ui-ext/vnc-keymaps';
import KeyTable from '@novnc/novnc/lib/input/keysym';

import { readFromClipboard } from '../../utils/utils';
import { PasteParams } from '../AccessConsoles/utils/accessConsoles';

import {
  ALT_L,
  CONTROL_L,
  F1,
  F10,
  F11,
  F12,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  ONE,
  TWO,
} from './utils/constants';
import { typeAndWait } from './utils/util';
import { RFB, ScanCodeName } from './utils/VncConsoleTypes';
import UnsupportedCharModal from './UnsupportedCharModal';

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
 * Open a modal if unsupported chars are detected.
 * @param params required for VNC (will do early return if missing)
 * @returns void
 */
export async function sendPasteCMD(params?: PasteParams) {
  const { createModal, selectedKeyboard, shouldFocusOnConsole = true } = params ?? {};
  if (!createModal || !selectedKeyboard) {
    return;
  }
  if (!canExecuteCommands(this)) {
    return;
  }

  const clipboardText = await readFromClipboard();
  if (typeof clipboardText !== 'string') {
    return;
  }
  const keyMap: KeyMapDef = keyMaps[selectedKeyboard];
  const mappedChars: CharMappingWithModifiers[] = [...clipboardText].map((codePoint) =>
    resolveCharMapping(codePoint, keyMap.map),
  );

  const unsupportedChars = mappedChars.filter(({ mapping }) => mapping.scanCode === 0);
  if (unsupportedChars.length) {
    createModal((props) => (
      <UnsupportedCharModal
        {...props}
        unsupportedChars={Array.from(
          new Set(unsupportedChars.map(({ mapping }) => mapping.char ?? '<unknown>')),
        )}
      />
    ));
    return;
  }

  for (const toType of mappedChars) {
    const { keysym, scanCode } = toType.mapping;

    // qemu maintains virtual keyboard state (caps lock, shift, etc)
    // keysyms are checked against that state and lower case version will be picked
    // if there is no shift/caps lock turn on
    for (const modifier of toType.modifiers) {
      await typeAndWait(this, modifier.keysym, true, modifier.scanCode);
    }

    await typeAndWait(this, keysym, true, scanCode);
    await typeAndWait(this, keysym, false, scanCode);

    for (const modifier of toType.modifiers) {
      await typeAndWait(this, modifier.keysym, false, modifier.scanCode);
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

// eslint-disable-next-line require-jsdoc
function createSendKeyFunction(keysym: number, scanCode: ScanCodeName) {
  return function () {
    if (!canExecuteCommands(this)) {
      return;
    }
    this.sendKey(keysym, scanCode, true);
    this.sendKey(keysym, scanCode, false);
  };
}

export const sendF1 = createSendKeyFunction(KeyTable.XK_F1, F1);
export const sendF2 = createSendKeyFunction(KeyTable.XK_F2, F2);
export const sendF3 = createSendKeyFunction(KeyTable.XK_F3, F3);
export const sendF4 = createSendKeyFunction(KeyTable.XK_F4, F4);
export const sendF5 = createSendKeyFunction(KeyTable.XK_F5, F5);
export const sendF6 = createSendKeyFunction(KeyTable.XK_F6, F6);
export const sendF7 = createSendKeyFunction(KeyTable.XK_F7, F7);
export const sendF8 = createSendKeyFunction(KeyTable.XK_F8, F8);
export const sendF9 = createSendKeyFunction(KeyTable.XK_F9, F9);
export const sendF10 = createSendKeyFunction(KeyTable.XK_F10, F10);
export const sendF11 = createSendKeyFunction(KeyTable.XK_F11, F11);
export const sendF12 = createSendKeyFunction(KeyTable.XK_F12, F12);
