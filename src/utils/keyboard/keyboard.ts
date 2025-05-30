import { ucs2keysym } from './keysym2ucs';
import { name2keysym } from './name2keysym';
import {
  CharMapping,
  CharMappingWithModifiers,
  HORIZONTAL_TAB,
  KeyMap,
  KeyModifier,
  LINE_FEED,
} from './types';

// scancodes based on '@novnc/novnc/lib/input/xtscancodes'
export const modifierToCharMapping: { [key in KeyModifier]: CharMapping } = {
  altgr: {
    keysym: 0xffea /* XK_Alt_R */,
    scanCode: 0xe038 /* "AltRight" */,
  },
  control: {
    keysym: 0xffe4 /* XK_Control_R */,
    scanCode: 0xe01d /* "ControlRight" */,
  },
  numlock: {
    keysym: 0xff7f /* XK_Num_Lock */,
    scanCode: 0x45 /*"NumLock"*/,
  },
  shift: {
    keysym: 0xffe1 /* XK_Shift_L */,
    scanCode: 0x36 /*"ShiftRight"*/,
  },
};

export const ENTER_MAPPING: CharMapping = {
  char: 'Enter',
  keysym: 0xff0d /*XK_Return*/,
  scanCode: 0x1c /*"Enter" */,
};
export const HORIZONTAL_TAB_MAPPING = {
  char: 'Tab',
  keysym: 0xff09 /* XK_Tab*/,
  scanCode: 0xf /*"Tab"  */,
};

const emptyMapping = (char: string, keysym: number): CharMappingWithModifiers => ({
  mapping: { char, keysym, scanCode: 0 },
  modifiers: [],
});

export const resolveCharMapping = (
  char: string,
  keymap: KeyMap,
): {
  mapping: CharMapping;
  modifiers: CharMapping[];
} => {
  const codePoint = char.codePointAt(0);
  if (codePoint === LINE_FEED) {
    return {
      mapping: ENTER_MAPPING,
      modifiers: [],
    };
  }

  if (codePoint === HORIZONTAL_TAB) {
    return {
      mapping: HORIZONTAL_TAB_MAPPING,
      modifiers: [],
    };
  }

  const unicode = char.codePointAt(0);
  const keysym = ucs2keysym(unicode);

  // based on https://github.com/qemu/qemu/blob/b69801dd6b1eb4d107f7c2f643adf0a4e3ec9124/ui/keymaps.c#L43
  // some rules are based on names in format UXXXX
  // FIXME: (only)'no' keymap uses keysyms as names in few cases (likely a bug)
  // example: 0x010000d7 which seems U00D7
  const unicodeBasedName = `U${Number(unicode).toString(16).toUpperCase().padStart(4, '0')}`;
  const [mnemonicName = unicodeBasedName] = name2keysym
    .filter(([, keysymCode]) => keysymCode === keysym)
    .map(([_name]) => _name);

  const [resolved] = keymap.filter(([name]) => name === mnemonicName);
  if (!resolved) {
    // no match in the keymap (by name)
    return emptyMapping(char, keysym);
  }

  const [, scanCode, ...modifiers] = resolved;

  return {
    mapping: {
      char,
      keysym,
      scanCode,
    },
    modifiers: modifiers.map((m) => modifierToCharMapping[m]),
  };
};
