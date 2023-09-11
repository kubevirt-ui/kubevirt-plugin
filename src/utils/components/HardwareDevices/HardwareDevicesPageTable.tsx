import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';

import useHardwareDevicesPageColumns from './list/hooks/useHardwareDevicesPageColumns ';
import { HardwareDevicePageRow } from './utils/constants';
import HardwareDevicesPageRow from './HardwareDevicesPageRow';

type HardwareDevicesPageTableProps = {
  devices: HardwareDevicePageRow[];
  error: Error;
  loaded: boolean;
};

const HardwareDevicesPageTable: FC<HardwareDevicesPageTableProps> = ({
  devices,
  error,
  loaded,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useHardwareDevicesPageColumns();

  return (
    <VirtualizedTable
      columns={columns}
      data={devices}
      EmptyMsg={() => <MutedTextSpan text={t('Not available')} />}
      loaded={loaded}
      loadError={error}
      Row={HardwareDevicesPageRow}
      unfilteredData={devices}
    />
  );
};

export default HardwareDevicesPageTable;
