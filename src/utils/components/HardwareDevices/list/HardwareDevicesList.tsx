import React, { FC, useMemo } from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import {
  getHardwareDeviceListRowId,
  getHardwareDevicesListColumns,
  HardwareDevicesListCallbacks,
} from './hardwareDevicesListDefinition';

type HardwareDevicesListProps = {
  devices?: V1GPU[] | V1HostDevice[];
  handleRemoveDevice?: (device: V1GPU | V1HostDevice) => void;
  noDataEmptyMsg?: string;
  showActions?: boolean;
};

const HardwareDevicesList: FC<HardwareDevicesListProps> = ({
  devices,
  handleRemoveDevice,
  noDataEmptyMsg,
  showActions = true,
}) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getHardwareDevicesListColumns(t, showActions), [t, showActions]);
  const callbacks: HardwareDevicesListCallbacks = useMemo(
    () => ({ handleRemoveDevice, t }),
    [handleRemoveDevice, t],
  );

  return (
    <KubevirtTable
      ariaLabel={t('Hardware devices table')}
      callbacks={showActions ? callbacks : undefined}
      columns={columns}
      data={devices ?? []}
      dataTest="hardware-devices-list"
      getRowId={getHardwareDeviceListRowId}
      initialSortKey="name"
      noDataEmptyText={noDataEmptyMsg ?? t('No hardware devices found')}
    />
  );
};

export default HardwareDevicesList;
