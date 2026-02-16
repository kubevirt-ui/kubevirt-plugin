import React, { FC, useMemo } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';
import { DataViewTh } from '@patternfly/react-data-view';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';

import { HardwareDevicePageRow } from './utils/constants';
import {
  getHardwareDevicePageRowId,
  getHardwareDevicesPageColumns,
} from './hardwareDevicesPageDefinition';

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

  const columns = useMemo(() => getHardwareDevicesPageColumns(t), [t]);

  const tableColumns: DataViewTh[] = useMemo(
    () => columns.map((col) => ({ cell: col.label, props: col.props })),
    [columns],
  );

  const rows = useMemo(
    () => generateRows(devices, columns, undefined, getHardwareDevicePageRowId),
    [devices, columns],
  );

  if (!loaded) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  if (error) {
    return <MutedTextSpan text={t('Error loading devices')} />;
  }

  if (isEmpty(devices)) {
    return <MutedTextSpan text={t('Not available')} />;
  }

  return (
    <DataViewTable
      aria-label={t('Hardware devices page table')}
      columns={tableColumns}
      rows={rows}
    />
  );
};

export default HardwareDevicesPageTable;
