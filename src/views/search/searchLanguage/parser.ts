import { KEY_ALIASES, NUMERIC_OPERATOR_REGEX, VALID_FILTER_KEYS } from './constants';
import { SearchToken } from './types';

export const parseSearchToken = (input: string): SearchToken => {
  const raw = input;
  let text = input.trim();
  let exclude = false;

  if (text.startsWith('-')) {
    exclude = true;
    text = text.slice(1);
  }

  const numericMatch = text.match(NUMERIC_OPERATOR_REGEX);
  if (numericMatch) {
    const [, rawKey, operator, value] = numericMatch;
    const key = resolveKey(rawKey.toLowerCase());
    if (VALID_FILTER_KEYS.has(key)) {
      return { exclude, key, operator, raw, values: [value] };
    }
  }

  const colonIndex = text.indexOf(':');
  if (colonIndex > 0) {
    const rawKey = text.slice(0, colonIndex);
    const valueStr = text.slice(colonIndex + 1);
    const key = resolveKey(rawKey.toLowerCase());

    if (VALID_FILTER_KEYS.has(key)) {
      const values = valueStr.split(',').filter(Boolean);
      return { exclude, key, raw, values };
    }
  }

  return { exclude: false, key: '', raw, values: [text] };
};

const resolveKey = (key: string): string => KEY_ALIASES[key] ?? key;
