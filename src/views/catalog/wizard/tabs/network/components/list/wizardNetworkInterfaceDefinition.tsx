import React, { ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import { NetworkCell, StateCell } from './WizardNetworkCells';

export type WizardNetworkCallbacks = {
  onUpdateVM?: (updateVM: V1VirtualMachine) => Promise<void>;
  vm: V1VirtualMachine;
};

const renderActionsCell = (
  row: NetworkPresentation,
  callbacks: WizardNetworkCallbacks,
): ReactNode => (
  <NetworkInterfaceActions
    nicName={row.network?.name}
    nicPresentation={row}
    onUpdateVM={callbacks.onUpdateVM}
    vm={callbacks.vm}
  />
);

export const getWizardNetworkColumns = (
  t: TFunction,
): ColumnConfig<NetworkPresentation, WizardNetworkCallbacks>[] => [
  {
    getValue: (row) => row.network?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <>{row.network?.name ?? NO_DATA_DASH}</>,
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
    renderCell: (row) => <NetworkCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.state ?? '',
    key: 'state',
    label: t('State'),
    renderCell: (row, callbacks) => <StateCell row={row} vm={callbacks.vm} />,
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
    renderCell: (row) => <>{row.iface?.macAddress ?? NO_DATA_DASH}</>,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getWizardNetworkRowId = (row: NetworkPresentation, index: number): string =>
  row.network?.name ?? `network-${index}`;
