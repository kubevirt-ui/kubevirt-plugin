import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { interfacesTypes } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

const useNetworkRowFilters = (): RowFilter[] => {
  const { t } = useKubevirtTranslation();
  const filters: RowFilter[] = React.useMemo(
    () => [
      {
        filter: (interfaces, obj) => {
          const drive = getNetworkInterfaceType(obj?.iface);
          return (
            interfaces.selected?.length === 0 ||
            interfaces.selected?.includes(drive) ||
            !interfaces?.all?.find((item) => item === drive)
          );
        },
        filterGroupName: t('Interface Type'),
        items: Object.keys(interfacesTypes).map((type) => ({
          id: type,
          title: interfacesTypes[type],
        })),
        reducer: (obj) => getNetworkInterfaceType(obj?.iface),
        type: 'interface-type',
      },
    ],
    [t],
  );

  return filters;
};

export default useNetworkRowFilters;
