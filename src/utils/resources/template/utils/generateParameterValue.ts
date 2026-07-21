const CHAR_CLASSES: Record<string, string> = {
  '\\A': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '\\a': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '\\d': '0123456789',
  '\\w': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
};

const pickRandomChar = (chars: string): string =>
  chars.charAt(Math.floor(Math.random() * chars.length));

const expandCharClass = (charClass: string): string => {
  if (CHAR_CLASSES[charClass]) {
    return CHAR_CLASSES[charClass];
  }

  // Ranges like a-z, A-Z, 0-9 inside [...]
  let chars = '';
  for (let i = 0; i < charClass.length; i++) {
    if (charClass[i + 1] === '-' && charClass[i + 2]) {
      const start = charClass.charCodeAt(i);
      const end = charClass.charCodeAt(i + 2);
      for (let code = start; code <= end; code++) {
        chars += String.fromCharCode(code);
      }
      i += 2;
      continue;
    }
    chars += charClass[i];
  }
  return chars;
};

/**
 * Generates a value from a virt-template / OpenShift-style expression.
 * Supports character classes ([a-z], [A-Z0-9], \w, \d, \a, \A) and {n} repetition.
 */
export const generateParameterValueFromExpression = (from: string): string => {
  if (!from) {
    return '';
  }

  let result = '';
  let i = 0;

  while (i < from.length) {
    if (from[i] === '[') {
      const end = from.indexOf(']', i);
      if (end === -1) {
        result += from[i];
        i += 1;
        continue;
      }

      const chars = expandCharClass(from.slice(i + 1, end));
      i = end + 1;

      let count = 1;
      const repeatMatch = from.slice(i).match(/^\{(\d+)\}/);
      if (repeatMatch) {
        count = Number(repeatMatch[1]);
        i += repeatMatch[0].length;
      }

      for (let n = 0; n < count; n++) {
        result += pickRandomChar(chars || 'x');
      }
      continue;
    }

    if (from[i] === '\\' && from[i + 1]) {
      const escape = `\\${from[i + 1]}`;
      const chars = CHAR_CLASSES[escape];
      i += 2;

      let count = 1;
      const repeatMatch = from.slice(i).match(/^\{(\d+)\}/);
      if (repeatMatch) {
        count = Number(repeatMatch[1]);
        i += repeatMatch[0].length;
      }

      if (chars) {
        for (let n = 0; n < count; n++) {
          result += pickRandomChar(chars);
        }
      } else {
        result += escape.slice(1).repeat(count);
      }
      continue;
    }

    result += from[i];
    i += 1;
  }

  return result;
};
