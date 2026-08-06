import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  interfaceTypesProxy,
  NetworkPresentation,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';

const INTERFACE_TYPE_FILTER_ID = 'interface-type';

const useNetworkRowFilters = (): KubevirtFilter<NetworkPresentation>[] => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => [
      {
        categoryLabel: t('Interface type'),
        id: INTERFACE_TYPE_FILTER_ID,
        match: (obj, selected) => selected.includes(getNetworkInterfaceType(obj?.iface)),
        options: Object.entries(interfaceTypesProxy).map(([value, label]) => ({ label, value })),
      },
    ],
    [t],
  );
};

export default useNetworkRowFilters;
