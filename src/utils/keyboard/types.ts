// Full list
// modifiers
//     0: Shift
//     1: Lock
//     2: Control
//     3: Mod1
//     4: Mod2
//     5: Mod3
//     6: Mod4
//     7: Mod5
//     8: NumLock
//     9: Alt
//    10: LevelThree
//    11: LAlt
//    12: RAlt
//    13: RControl
//    14: LControl
//    15: ScrollLock
//    16: LevelFive
//    17: AltGr
//    18: Meta
//    19: Super
//    20: Hyper

// Limit the list to modifiers that are actually used in the keymaps
export type KeyModifier = 'altgr' | 'control' | 'numlock' | 'shift';

export type KeyMapping =
  | [string, number, KeyModifier, KeyModifier]
  | [string, number, KeyModifier]
  | [string, number];

export type KeyMap = KeyMapping[];

export type KeyMapDef = {
  l: string;
  m?: string;
  map: KeyMap;
  v?: string;
};

export type CharMapping = {
  char?: string;
  keysym: number;
  scanCode: number;
};

export type CharMappingWithModifiers = {
  mapping: CharMapping;
  modifiers: CharMapping[];
};

export type KeyboardLayout =
  | 'ar'
  | 'bepo'
  | 'cz'
  | 'da'
  | 'de-ch'
  | 'de'
  | 'en-gb'
  | 'en-us'
  | 'es'
  | 'et'
  | 'fi'
  | 'fo'
  | 'fr-be'
  | 'fr-ca'
  | 'fr-ch'
  | 'fr'
  | 'hr'
  | 'hu'
  | 'is'
  | 'it'
  | 'ja'
  | 'lt'
  | 'lv'
  | 'mk'
  | 'nl'
  // | 'no'
  | 'pl'
  | 'pt-br'
  | 'pt'
  | 'ru'
  // | 'sl'
  // | 'sv'
  | 'th'
  | 'tr';

export const LINE_FEED = 10;
export const HORIZONTAL_TAB = 9;
