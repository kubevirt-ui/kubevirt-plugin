import { type TFunction } from 'i18next';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/KubevirtFilterToolbar/constants';
import {
  type FilterableObject,
  type KubevirtFilter,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { fuzzyCaseInsensitive, isEmpty } from '@kubevirt-utils/utils/utils';

export const getNameFilter = (t: TFunction): KubevirtFilter<FilterableObject> => ({
  categoryLabel: t('Name'),
  id: STATIC_SEARCH_FILTERS.name,
  match: (obj, selected): boolean => {
    if (isEmpty(selected)) return true;

    const name = getName(obj) ?? '';
    return selected.some((filter) => fuzzyCaseInsensitive(filter, name));
  },
});
