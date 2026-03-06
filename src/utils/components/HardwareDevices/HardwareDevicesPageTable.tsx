import React, { FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { HardwareDevicePageRow } from './utils/constants';
import {
  getHardwareDevicePageRowId,
  getHardwareDevicesPageColumns,
} from './hardwareDevicesPageDefinition';

type HardwareDevicesPageTableProps = {
  devices: HardwareDevicePageRow[];
  error?: Error;
  loaded: boolean;
};

const HardwareDevicesPageTable: FC<HardwareDevicesPageTableProps> = ({
  devices,
  error,
  loaded,
}) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getHardwareDevicesPageColumns(t), [t]);

  return (
    <KubevirtTable
      ariaLabel={t('Hardware devices page table')}
      columns={columns}
      data={devices}
      dataTest="hardware-devices-page-table"
      fixedLayout
      getRowId={getHardwareDevicePageRowId}
      loaded={loaded}
      loadError={error}
      noDataEmptyText={t('No hardware devices found')}
    />
  );
};

export default HardwareDevicesPageTable;
