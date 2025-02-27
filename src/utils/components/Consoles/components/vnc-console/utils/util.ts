// keyboard keys that need to press&hold the shiftKey
export const isShiftKeyRequired = (char: string): boolean =>
  !!char?.match(/[A-Z~!@#$%^&*()_+}{|\":?><]/);

export const LINE_FEED = 10;
export const HORIZONTAL_TAB = 9;

export const LATIN_1_FIRST_CHAR = 0x20;
export const LATIN_1_LAST_CHAR = 0xff;
