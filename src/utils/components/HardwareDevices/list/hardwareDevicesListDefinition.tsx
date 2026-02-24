import React, { ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { V1GPU, V1HostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export type HardwareDevice = V1GPU | V1HostDevice;

const TABLE_COLUMN_CLASSES = ['pf-m-width-20', 'pf-m-width-30', 'pf-v6-c-table__action'];

export type HardwareDevicesListCallbacks = {
  handleRemoveDevice?: (device: HardwareDevice) => void;
  t: TFunction;
};

const renderRemoveButton = (
  device: HardwareDevice,
  callbacks: HardwareDevicesListCallbacks,
): ReactNode => {
  if (!callbacks?.handleRemoveDevice) return null;

  return (
    <Button
      aria-label={callbacks.t('Remove device')}
      icon={<MinusCircleIcon />}
      onClick={() => callbacks.handleRemoveDevice(device)}
      variant={ButtonVariant.plain}
    />
  );
};

export const getHardwareDevicesListColumns = (
  t: TFunction,
  showActions = true,
): ColumnConfig<HardwareDevice, HardwareDevicesListCallbacks>[] => {
  const baseColumns: ColumnConfig<HardwareDevice, HardwareDevicesListCallbacks>[] = [
    {
      key: 'name',
      label: t('Name'),
      props: { className: TABLE_COLUMN_CLASSES[0] },
      renderCell: (device) => device.name ?? NO_DATA_DASH,
      sortable: true,
    },
    {
      key: 'deviceName',
      label: t('Device name'),
      props: { className: TABLE_COLUMN_CLASSES[1] },
      renderCell: (device) => device.deviceName ?? NO_DATA_DASH,
      sortable: true,
    },
  ];

  if (showActions) {
    baseColumns.push({
      key: 'actions',
      label: '',
      props: { className: TABLE_COLUMN_CLASSES[2] },
      renderCell: renderRemoveButton,
    });
  }

  return baseColumns;
};

export const getHardwareDeviceListRowId = (device: HardwareDevice): string =>
  `${device.name ?? NO_DATA_DASH}-${device.deviceName ?? NO_DATA_DASH}`;
