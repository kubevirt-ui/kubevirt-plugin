import React, { FC } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { Td, Tr } from '@patternfly/react-table';

import { MigrationDisksTableData } from '../../utils/diskData';

import { columnNames } from './constants';

type VMDiskTableRowProps = {
  diskData: MigrationDisksTableData;
  rowIndex: number;
  selectDiskData: (diskData: MigrationDisksTableData, isSelected: boolean) => void;
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  singleVMView?: boolean;
};

const VMDiskTableRow: FC<VMDiskTableRowProps> = ({
  diskData,
  rowIndex,
  selectDiskData,
  selectedPVCs,
}) => (
  <Tr>
    <Td
      select={{
        isDisabled: !diskData.isSelectable,
        isSelected: Boolean(selectedPVCs.find((pvc) => getName(pvc) === getName(diskData.pvc))),
        onSelect: (_event, isSelecting) => selectDiskData(diskData, isSelecting),
        rowIndex,
      }}
    />
    <Td dataLabel={columnNames.name}>{diskData.name}</Td>
    <Td dataLabel={columnNames.drive}>{diskData.drive}</Td>
    <Td dataLabel={columnNames.storageClass}>{diskData.storageClass}</Td>
    <Td dataLabel={columnNames.size}>{readableSizeUnit(diskData?.size)}</Td>
  </Tr>
);

export default VMDiskTableRow;
