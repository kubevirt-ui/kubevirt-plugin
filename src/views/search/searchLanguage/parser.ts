import { NUMERIC_OPERATOR_REGEX, SEARCH_KEY_TO_FILTER_TYPE } from './constants';
import { SearchToken } from './types';
import { getSanitizedInput, isExcludedToken } from './utils';

export const parseSearchToken = (input: string): SearchToken => {
  const raw = input;
  const trimmedInput = input.trim();
  const text = getSanitizedInput(trimmedInput);
  const exclude = isExcludedToken(trimmedInput);

  const numericMatch = text.match(NUMERIC_OPERATOR_REGEX);
  if (numericMatch) {
    const [, rawKey, operator, value] = numericMatch;
    const searchKey = rawKey.toLowerCase();
    const filterType = SEARCH_KEY_TO_FILTER_TYPE.get(searchKey);
    if (filterType) {
      return { exclude, filterType, operator, raw, searchKey, values: value ? [value] : [] };
    }
  }

  const colonIndex = text.indexOf(':');
  if (colonIndex > 0) {
    const rawKey = text.slice(0, colonIndex);
    const valueStr = text.slice(colonIndex + 1);
    const searchKey = rawKey.toLowerCase();
    const filterType = SEARCH_KEY_TO_FILTER_TYPE.get(searchKey);

    if (filterType) {
      const values = valueStr.split(',').filter(Boolean);
      return { exclude, filterType, raw, searchKey, values };
    }
  }

  return { exclude, raw, values: [text] };
};
