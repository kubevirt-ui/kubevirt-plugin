import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useNetworkColumns = () => {
  const { t } = useTranslation();

  const columns: TableColumn<NetworkPresentation>[] = React.useMemo(
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
        sort: 'iface.masquerade' || 'iface.bridge' || 'iface.sriov',
      },
      {
        title: t('MAC address'),
        id: 'macAddress',
        transforms: [sortable],
        sort: 'iface.macAddress',
      },
      {
        title: '',
        id: 'actions',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  return columns;
};

export default useNetworkColumns;
