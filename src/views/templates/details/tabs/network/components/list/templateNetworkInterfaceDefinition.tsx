import React, { ReactNode } from 'react';
import { TFunction } from 'i18next';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import TemplateValue from '@kubevirt-utils/components/TemplateValue/TemplateValue';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  NetworkPresentation,
  POD_NETWORK_SORT_KEY,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  getPrintableNetworkInterfaceType,
  isPodNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';

import NetworkInterfaceActions from './NetworkInterfaceActions';
import TemplateNetworkCell from './TemplateNetworkCell';
import TemplateStateCell from './TemplateStateCell';

export type TemplateNetworkCallbacks = {
  template: V1Template;
};

const renderActionsCell = (
  row: NetworkPresentation,
  callbacks: TemplateNetworkCallbacks,
): ReactNode => (
  <NetworkInterfaceActions
    nicName={row.network?.name}
    nicPresentation={row}
    template={callbacks.template}
  />
);

export const getTemplateNetworkColumns = (
  t: TFunction,
): ColumnConfig<NetworkPresentation, TemplateNetworkCallbacks>[] => [
  {
    getValue: (row) => row.network?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <TemplateValue value={row.network?.name ?? NO_DATA_DASH} />,
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.model ?? '',
    key: 'model',
    label: t('Model'),
    renderCell: (row) => <>{row.iface?.model ?? NO_DATA_DASH}</>,
    sortable: true,
  },
  {
    getValue: (row) =>
      isPodNetwork(row.network) ? POD_NETWORK_SORT_KEY : row.network?.multus?.networkName ?? '',
    key: 'network',
    label: t('Network'),
    renderCell: (row) => <TemplateNetworkCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.state ?? '',
    key: 'state',
    label: t('State'),
    renderCell: (row, callbacks) => <TemplateStateCell row={row} template={callbacks.template} />,
    sortable: true,
  },
  {
    getValue: (row) => getPrintableNetworkInterfaceType(row.iface) ?? '',
    key: 'type',
    label: t('Type'),
    renderCell: (row) => <>{getPrintableNetworkInterfaceType(row.iface) ?? NO_DATA_DASH}</>,
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.macAddress ?? '',
    key: 'macAddress',
    label: t('MAC address'),
    renderCell: (row) => <TemplateValue value={row.iface?.macAddress ?? NO_DATA_DASH} />,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getTemplateNetworkRowId = (row: NetworkPresentation, index: number): string =>
  row.network?.name ?? `network-${index}`;
