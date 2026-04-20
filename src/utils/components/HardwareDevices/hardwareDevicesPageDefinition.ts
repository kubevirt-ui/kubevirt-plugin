import { TFunction } from 'i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { HardwareDevicePageRow } from './utils/constants';

const TABLE_COLUMN_CLASSES = ['pf-m-width-20', 'pf-m-width-20'];

export const getHardwareDevicesPageColumns = (
  t: TFunction,
): ColumnConfig<HardwareDevicePageRow, undefined>[] => [
  {
    key: 'resourceName',
    label: t('Device name'),
    props: { className: TABLE_COLUMN_CLASSES[0] },
    renderCell: (device) => device?.resourceName ?? NO_DATA_DASH,
  },
  {
    key: 'selector',
    label: t('Selector'),
    props: { className: TABLE_COLUMN_CLASSES[1] },
    renderCell: (device) => device?.selector ?? NO_DATA_DASH,
  },
];

export const getHardwareDevicePageRowId = (device: HardwareDevicePageRow): string =>
  `${device.resourceName ?? NO_DATA_DASH}-${device.selector ?? NO_DATA_DASH}`;
