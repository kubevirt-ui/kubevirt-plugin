import { useCallback, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { nicsSorting } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useNetworkColumns = (data: NetworkPresentation[]) => {
  const { t } = useKubevirtTranslation();

  const sorting = useCallback((direction) => nicsSorting(data, direction), [data]);

  const columns: TableColumn<NetworkPresentation>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: 'network.name',
      },
      {
        title: t('Model'),
        id: 'model',
        transforms: [sortable],
        sort: 'iface.model',
      },
      {
        title: t('Network'),
        id: 'network',
        transforms: [sortable],
        sort: 'network.pod' || 'network.multus.networkName',
      },
      {
        title: t('Type'),
        id: 'type',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction),
      },
      {
        title: t('MAC address'),
        id: 'macAddress',
        transforms: [sortable],
        sort: 'iface.macAddress',
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [sorting, t],
  );

  return columns;
};

export default useNetworkColumns;
