import { TFunction } from 'i18next';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/KubevirtFilterToolbar/constants';
import {
  FilterableObject,
  KubevirtFilter,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { fuzzyCaseInsensitive } from '@kubevirt-utils/utils/utils';

export const getNameFilter = (t: TFunction): KubevirtFilter<FilterableObject> => ({
  categoryLabel: t('Name'),
  id: STATIC_SEARCH_FILTERS.name,
  match: (obj, selected) => {
    const nameFilter = selected[0] ?? '';
    return !nameFilter || fuzzyCaseInsensitive(nameFilter, getName(obj) ?? '');
  },
});
