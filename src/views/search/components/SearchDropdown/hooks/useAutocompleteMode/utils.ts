import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getFilterDefinition } from '@search/searchLanguage/utils';

import { SearchKeyBadge } from '../../types';

export const getSearchBadge = (
  key: string,
  searchKeyBadges: SearchKeyBadge[],
): SearchKeyBadge | undefined =>
  searchKeyBadges.find((b) => b.searchKey.toLowerCase() === key.toLowerCase());

export const hasOptions = (filterType: string, filterDefinitions: KubevirtFilter[]): boolean =>
  !isEmpty(getFilterDefinition(filterType, filterDefinitions)?.options);

export const hasOperatorSign = (input: string, key: string): boolean => {
  const afterKey = input.slice(key.length);
  return /^[><=]/.test(afterKey);
};

export const getValuesPart = (
  input: string,
  colonIndex: number,
): { activeSegment: string; selectedValues: string[] } => {
  if (colonIndex <= 0) return { activeSegment: '', selectedValues: [] };

  const valuesPart = input.slice(colonIndex + 1);
  const segments = valuesPart.split(',');
  const activeSegment = segments[segments.length - 1] || '';
  const selectedValues = segments.slice(0, -1).filter(Boolean);

  return { activeSegment, selectedValues };
};
