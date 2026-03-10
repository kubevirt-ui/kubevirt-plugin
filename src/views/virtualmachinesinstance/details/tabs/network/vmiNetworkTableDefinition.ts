import { TFunction } from 'react-i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';

export const getVMINetworkColumns = (
  t: TFunction,
): ColumnConfig<VMINetworkPresentation, undefined>[] => [
  {
    getValue: (r) => r.network?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (r) => r.network?.name ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.iface?.model ?? '',
    key: 'model',
    label: t('Model'),
    renderCell: (r) => r.iface?.model ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.network?.multus?.networkName ?? (r.network?.pod ? 'pod' : ''),
    key: 'network',
    label: t('Network'),
    renderCell: (r) =>
      r.network ? getNetworkNameLabel(t, { network: r.network }) || NO_DATA_DASH : NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => (r.iface ? getPrintableNetworkInterfaceType(r.iface) : ''),
    key: 'type',
    label: t('Type'),
    renderCell: (r) => (r.iface ? getPrintableNetworkInterfaceType(r.iface) : NO_DATA_DASH),
    sortable: true,
  },
  {
    getValue: (r) => r.iface?.macAddress ?? '',
    key: 'macAddress',
    label: t('MAC Address'),
    renderCell: (r) => r.iface?.macAddress ?? NO_DATA_DASH,
    sortable: true,
  },
];

export const getVMINetworkRowId = (row: VMINetworkPresentation): string =>
  `${row.network?.name ?? NO_DATA_DASH}-${row.iface?.macAddress ?? NO_DATA_DASH}`;
