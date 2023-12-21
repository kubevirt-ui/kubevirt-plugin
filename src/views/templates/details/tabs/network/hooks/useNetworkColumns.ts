import { useCallback, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { sortNICs } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useNetworkColumns = (data: NetworkPresentation[]) => {
  const { t } = useKubevirtTranslation();

  const sorting = useCallback((direction) => sortNICs(data, direction), [data]);

  const columns: TableColumn<NetworkPresentation>[] = useMemo(
    () => [
      {
        id: 'name',
        sort: 'network.name',
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'model',
        sort: 'iface.model',
        title: t('Model'),
        transforms: [sortable],
      },
      {
        id: 'network',
        sort: 'network.pod' || 'network.multus.networkName',
        title: t('Network'),
        transforms: [sortable],
      },
      {
        id: 'type',
        sort: (_, direction) => sorting(direction),
        title: t('Type'),
        transforms: [sortable],
      },
      {
        id: 'macAddress',
        sort: 'iface.macAddress',
        title: t('MAC address'),
        transforms: [sortable],
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [sorting, t],
  );

  return columns;
};

export default useNetworkColumns;
