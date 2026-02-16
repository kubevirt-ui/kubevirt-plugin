import { TFunction } from 'react-i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { HardwareDevicePageRow } from './utils/constants';

/** CSS classes for column widths */
const tableColumnClasses = ['pf-m-width-20', 'pf-m-width-20'];

/**
 * Column definitions for the hardware devices page table (no sorting, no callbacks)
 * @param t the i18n translation function
 */
export const getHardwareDevicesPageColumns = (
  t: TFunction,
): ColumnConfig<HardwareDevicePageRow, undefined>[] => [
  {
    key: 'resourceName',
    label: t('Device name'),
    props: { className: tableColumnClasses[0] },
    renderCell: (device) => device?.resourceName || NO_DATA_DASH,
  },
  {
    key: 'selector',
    label: t('Selector'),
    props: { className: tableColumnClasses[1] },
    renderCell: (device) => device?.selector || NO_DATA_DASH,
  },
];

/**
 * Generate unique row ID for hardware device page rows
 * @param device the hardware device page row
 * @param index the row index
 */
export const getHardwareDevicePageRowId = (device: HardwareDevicePageRow, index: number): string =>
  `${device.resourceName}-${index}`;
