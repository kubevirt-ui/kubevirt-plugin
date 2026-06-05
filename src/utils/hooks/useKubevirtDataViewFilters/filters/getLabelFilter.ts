import { TFunction } from 'i18next';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { getLabelsAsString } from '@kubevirt-utils/components/ListPageFilter/utils';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getLabelFilter = (t: TFunction): KubevirtFilter<K8sResourceCommon> => ({
  categoryLabel: t('Label'),
  id: STATIC_SEARCH_FILTERS.labels,
  match: (obj, selected) => {
    const objectLabels = getLabelsAsString(obj);
    return selected.every((label) => objectLabels.includes(label));
  },
});
