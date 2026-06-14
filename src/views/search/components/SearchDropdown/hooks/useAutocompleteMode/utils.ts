import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { SEARCH_KEY_BADGES } from '../../constants';
import { SearchKeyBadge } from '../../types';

export const getSearchBadge = (key: string): SearchKeyBadge | undefined =>
  SEARCH_KEY_BADGES.find((b) => b.searchKey === key.toLowerCase());

export const hasOptions = (filterType: string, filterDefinitions: KubevirtFilter[]): boolean => {
  const filterDefinition = filterDefinitions.find((d) => d.id === filterType);
  return !isEmpty(filterDefinition?.options);
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
