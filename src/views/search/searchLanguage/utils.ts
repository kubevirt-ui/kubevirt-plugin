import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { EXCLUSION_PREFIX } from './constants';
import { parseSearchToken } from './parser';
import { TokenParts } from './types';

export const isExcludedToken = (input: string): boolean => input.startsWith(EXCLUSION_PREFIX);

export const getExclusionPrefix = (input: string): string =>
  isExcludedToken(input) ? EXCLUSION_PREFIX : '';

export const getSanitizedInput = (input: string): string =>
  isExcludedToken(input) ? input.slice(EXCLUSION_PREFIX.length) : input;

export const toSearchString = (value: string, isExcluded: boolean): string =>
  isExcluded ? `${EXCLUSION_PREFIX}${value}` : value;

export const splitAtLastToken = (text: string): { lastToken: string; prefix: string } => {
  const trimmed = text.trimStart();
  const lastSpaceIdx = trimmed.lastIndexOf(' ');
  return {
    lastToken: trimmed.slice(lastSpaceIdx + 1),
    prefix: lastSpaceIdx < 0 ? '' : trimmed.slice(0, lastSpaceIdx + 1),
  };
};

export const getLastToken = (text: string): string => splitAtLastToken(text).lastToken;

const getTokenAtCursor = (
  text: string,
  cursorPos: number,
): {
  token: string;
  tokenEnd: number;
  tokenStart: number;
} => {
  const trimmed = text.trimStart();
  const offset = text.length - trimmed.length;
  const pos = Math.min(Math.max(0, cursorPos - offset), trimmed.length);

  const leftIsSpace = pos === 0 || trimmed[pos - 1] === ' ';
  const rightIsSpace = pos >= trimmed.length || trimmed[pos] === ' ';

  if (leftIsSpace && rightIsSpace) {
    return { token: '', tokenEnd: cursorPos, tokenStart: cursorPos };
  }

  let start = pos;
  while (start > 0 && trimmed[start - 1] !== ' ') start--;

  let end = pos;
  while (end < trimmed.length && trimmed[end] !== ' ') end++;

  return {
    token: trimmed.slice(start, end),
    tokenEnd: end + offset,
    tokenStart: start + offset,
  };
};

export const splitAtCursorToken = (text: string, cursorPos: number): TokenParts => {
  const { token, tokenEnd, tokenStart } = getTokenAtCursor(text, cursorPos);
  return {
    prefix: text.slice(0, tokenStart),
    suffix: text.slice(tokenEnd),
    token,
  };
};

/**
 * Detects tokens where a valid key and operator/colon are present but no value
 * has been provided yet (e.g. "status:", "os:", "vcpu>").
 */
export const isIncompleteToken = (tokenText: string): boolean => {
  if (!tokenText) return false;
  const token = parseSearchToken(tokenText);
  if (!token.filterType) return false;
  return isEmpty(token.values);
};

export const getFilterDefinition = (
  filterType: string,
  filterDefinitions: KubevirtFilter[],
): KubevirtFilter | undefined => filterDefinitions.find((d) => d.id === filterType);
