import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getNetworkInterfaceType, interfacesTypes } from '../utils/utils';

const useNetworkRowFilters = (): RowFilter[] => {
  const { t } = useKubevirtTranslation();
  const filters: RowFilter[] = React.useMemo(
    () => [
      {
        filterGroupName: t('Interface Type'),
        type: 'interface-type',
        reducer: (obj) => getNetworkInterfaceType(obj?.iface),
        filter: (interfaces, obj) => {
          const drive = getNetworkInterfaceType(obj?.iface);
          return (
            interfaces.selected?.length === 0 ||
            interfaces.selected?.includes(drive) ||
            !interfaces?.all?.find((item) => item === drive)
          );
        },
        items: Object.keys(interfacesTypes).map((type) => ({
          id: type,
          title: interfacesTypes[type],
        })),
      },
    ],
    [t],
  );

  return filters;
};

export default useNetworkRowFilters;
