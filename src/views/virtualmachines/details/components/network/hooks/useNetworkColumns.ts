import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { NetworkInterfaceRowProps } from '../NetworkInterfaceRow';

const useNetworkColumns = () => {
  const { t } = useTranslation();

  const columns: TableColumn<NetworkInterfaceRowProps>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
      },
      {
        title: t('Model'),
        id: 'model',
      },
      {
        title: t('Network'),
        id: 'network',
      },
      {
        title: t('Type'),
        id: 'type',
      },
      {
        title: t('MAC address'),
        id: 'mac-address',
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
