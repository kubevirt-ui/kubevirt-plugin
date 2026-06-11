import { TFunction } from 'i18next';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { fuzzyCaseInsensitive } from '@kubevirt-utils/components/ListPageFilter/utils';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getNameFilter = (t: TFunction): KubevirtFilter<K8sResourceCommon> => ({
  categoryLabel: t('Name'),
  id: STATIC_SEARCH_FILTERS.name,
  match: (obj, selected) => {
    const nameFilter = selected[0] ?? '';
    return !nameFilter || fuzzyCaseInsensitive(nameFilter, getName(obj) ?? '');
  },
});
