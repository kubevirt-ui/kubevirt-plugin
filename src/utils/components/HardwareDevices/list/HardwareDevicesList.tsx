import * as React from 'react';
import { useMemo } from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DataViewTable } from '@patternfly/react-data-view';
import { DataViewTh } from '@patternfly/react-data-view';

import {
  getHardwareDeviceListRowId,
  getHardwareDevicesListColumns,
  HardwareDevicesListCallbacks,
} from './hardwareDevicesListDefinition';

type HardwareDevicesListProps = {
  devices?: V1GPU[] | V1HostDevice[];
  handleRemoveDevice: (device: V1GPU | V1HostDevice) => void;
};

const HardwareDevicesList: React.FC<HardwareDevicesListProps> = ({
  devices,
  handleRemoveDevice,
}) => {
  const { t } = useKubevirtTranslation();
  const safeDevices = devices ?? [];

  const columns = useMemo(() => getHardwareDevicesListColumns(t), [t]);

  const tableColumns: DataViewTh[] = useMemo(
    () => columns.map((col) => ({ cell: col.label, props: col.props })),
    [columns],
  );

  const callbacks: HardwareDevicesListCallbacks = useMemo(
    () => ({ handleRemoveDevice, t }),
    [handleRemoveDevice, t],
  );

  const rows = useMemo(
    () => generateRows(safeDevices, columns, callbacks, getHardwareDeviceListRowId),
    [safeDevices, columns, callbacks],
  );

  if (isEmpty(safeDevices)) {
    return <div className="pf-v6-u-text-align-center">{t('No hardware devices found')}</div>;
  }

  return (
    <DataViewTable aria-label={t('Hardware devices table')} columns={tableColumns} rows={rows} />
  );
};

export default HardwareDevicesList;
