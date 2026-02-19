import React from 'react';
import { TFunction } from 'react-i18next';

import { V1GPU, V1HostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

type HardwareDevice = V1GPU | V1HostDevice;

const tableColumnClasses = ['pf-m-width-20', 'pf-m-width-30', 'pf-v6-c-table__action'];

export type HardwareDevicesListCallbacks = {
  handleRemoveDevice: (device: HardwareDevice) => void;
  t: TFunction;
};

const renderRemoveButton = (
  device: HardwareDevice,
  { handleRemoveDevice, t }: HardwareDevicesListCallbacks,
): React.ReactNode => (
  <Button
    aria-label={t('Remove device')}
    icon={<MinusCircleIcon />}
    onClick={() => handleRemoveDevice(device)}
    variant={ButtonVariant.plain}
  />
);

export const getHardwareDevicesListColumns = (
  t: TFunction,
): ColumnConfig<HardwareDevice, HardwareDevicesListCallbacks>[] => [
  {
    key: 'name',
    label: t('Name'),
    props: { className: tableColumnClasses[0] },
    renderCell: (device) => device.name,
  },
  {
    key: 'deviceName',
    label: t('Device name'),
    props: { className: tableColumnClasses[1] },
    renderCell: (device) => device.deviceName,
  },
  {
    key: 'actions',
    label: '',
    props: { className: tableColumnClasses[2] },
    renderCell: renderRemoveButton,
  },
];

export const getHardwareDeviceListRowId = (device: HardwareDevice, index: number): string =>
  `${device.name}-${index}`;
