import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { EXCLUSION_PREFIX } from './constants';
import { parseSearchToken } from './parser';

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
