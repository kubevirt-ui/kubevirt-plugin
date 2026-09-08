import { type TFunction } from 'i18next';

import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { type VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';

export const getVMINetworkColumns = (
  t: TFunction,
): ColumnConfig<VMINetworkPresentation, undefined>[] => [
  {
    getValue: (row) => row.network?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => row.network?.name ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.model ?? '',
    key: 'model',
    label: t('Model'),
    renderCell: (row) => row.iface?.model ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (row) => row.network?.multus?.networkName ?? (row.network?.pod ? 'pod' : ''),
    key: 'network',
    label: t('Network'),
    renderCell: (row) =>
      row.network
        ? (getNetworkNameLabel(t, { network: row.network }) ?? NO_DATA_DASH)
        : NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (row) => (row.iface ? getPrintableNetworkInterfaceType(row.iface) : ''),
    key: 'type',
    label: t('Type'),
    renderCell: (row) => (row.iface ? getPrintableNetworkInterfaceType(row.iface) : NO_DATA_DASH),
    sortable: true,
  },
  {
    getValue: (row) => row.iface?.macAddress ?? '',
    key: 'macAddress',
    label: t('MAC Address'),
    renderCell: (row) => row.iface?.macAddress ?? NO_DATA_DASH,
    sortable: true,
  },
];

export const getVMINetworkRowId = (row: VMINetworkPresentation): string =>
  `${row.network?.name ?? NO_DATA_DASH}-${row.iface?.macAddress ?? NO_DATA_DASH}`;
