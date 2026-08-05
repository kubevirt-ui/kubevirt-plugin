import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  interfaceLabelsProxy,
  interfaceTypesProxy,
} from '@kubevirt-utils/resources/vm/utils/network/constants';

import { SimpleNICPresentation } from '../utils/types';

const INTERFACE_TYPE_FILTER_ID = 'interface-type';

const useNetworkRowFilters = (): KubevirtFilter<SimpleNICPresentation>[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
      {
        categoryLabel: t('Interface type'),
        id: INTERFACE_TYPE_FILTER_ID,
        match: (obj, selected) => selected.includes(interfaceLabelsProxy[obj?.type]),
        options: Object.entries(interfaceTypesProxy).map(([value, label]) => ({ label, value })),
      },
    ],
    [t],
  );
};

export default useNetworkRowFilters;
