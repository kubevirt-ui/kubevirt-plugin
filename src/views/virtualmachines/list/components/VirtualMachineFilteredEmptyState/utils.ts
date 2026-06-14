import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { EXCLUSION_PREFIX, EXCLUSION_URL_PREFIX } from '@search/searchLanguage/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const buildFilterQueryString = (filters: KubevirtFilterState): string =>
  Object.entries(filters)
    .filter(([, values]) => !isEmpty(values))
    .map(([key, values]) => `${key}:${values.join(',')}`)
    .join(' ');

export const filterToSearchToken = (key: string, value: string): string => {
  const isExcluded = value.startsWith(EXCLUSION_URL_PREFIX);
  const cleanValue = isExcluded ? value.slice(1) : value;

  if (key === VirtualMachineRowFilterType.Name) {
    return isExcluded ? `${EXCLUSION_PREFIX}${cleanValue}` : cleanValue;
  }

  return isExcluded ? `${EXCLUSION_PREFIX}${key}:${cleanValue}` : `${key}:${cleanValue}`;
};
