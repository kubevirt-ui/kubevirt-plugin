/* eslint-disable require-jsdoc */
import React from 'react';

import {
  CharMappingWithModifiers,
  KeyMapDef,
  keyMaps,
  resolveCharMapping,
} from '@kubevirt-ui/vnc-keymaps';
import KeyTable from '@novnc/novnc/lib/input/keysym';
import RFBCreate from '@novnc/novnc/lib/rfb';

import { readFromClipboard, sleep } from '../../utils/utils';
import { PasteParams } from '../AccessConsoles/utils/accessConsoles';

import UnsupportedCharModal from './UnsupportedCharModal';

const canExecuteCommands = (rfb) => rfb._rfbConnectionState === 'connected' && !rfb._viewOnly;

function sendCtrlAltPlusKey(rfb, keysym, code) {
  if (!canExecuteCommands(rfb)) {
    return;
  }
  rfb.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true);
  rfb.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true);
  rfb.sendKey(keysym, code, true);
  rfb.sendKey(keysym, code, false);
  rfb.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false);
  rfb.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false);
}

export function sendCtrlAlt1() {
  sendCtrlAltPlusKey(this, KeyTable.XK_1, 'One');
}

export function sendCtrlAlt2() {
  sendCtrlAltPlusKey(this, KeyTable.XK_2, 'Two');
}

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
  const text = clipboardText;
  const keyMap: KeyMapDef = keyMaps[selectedKeyboard];
  const mappedChars: CharMappingWithModifiers[] = [...text].map((codePoint) =>
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
      RFBCreate.messages.QEMUExtendedKeyEvent(this._sock, modifier.keysym, true, modifier.scanCode);
      await sleep(50);
    }

    RFBCreate.messages.QEMUExtendedKeyEvent(this._sock, keysym, true, scanCode);
    // long text is getting truncated without a delay
    await sleep(50);
    RFBCreate.messages.QEMUExtendedKeyEvent(this._sock, keysym, false, scanCode);
    await sleep(50);
    for (const modifier of toType.modifiers) {
      RFBCreate.messages.QEMUExtendedKeyEvent(
        this._sock,
        modifier.keysym,
        false,
        modifier.scanCode,
      );
      await sleep(50);
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
