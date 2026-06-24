import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const buildFilterQueryString = (filters: KubevirtFilterState): string =>
  Object.entries(filters)
    .filter(([, values]) => !isEmpty(values))
    .map(([key, values]) => `${key}:${values.join(',')}`)
    .join(' ');
