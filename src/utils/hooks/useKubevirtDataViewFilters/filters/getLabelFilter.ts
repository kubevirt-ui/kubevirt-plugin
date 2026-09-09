import { type TFunction } from 'i18next';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/KubevirtFilterToolbar/constants';
import {
  type FilterableObject,
  type KubevirtFilter,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getLabelsAsString } from '@kubevirt-utils/utils/labelUtils';

export const getLabelFilter = (t: TFunction): KubevirtFilter<FilterableObject> => ({
  categoryLabel: t('Label'),
  id: STATIC_SEARCH_FILTERS.labels,
  match: (obj, selected): boolean => {
    const objectLabels = getLabelsAsString(obj);
    return selected.every((label) => objectLabels.includes(label));
  },
});
