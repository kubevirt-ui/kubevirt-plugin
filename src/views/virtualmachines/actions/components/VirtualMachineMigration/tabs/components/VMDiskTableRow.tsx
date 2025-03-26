import React, { Dispatch, FC, SetStateAction } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { Td, Tr } from '@patternfly/react-table';

import { columnNames } from './constants';
import { MigrationDisksTableData } from './utils';

type VMDiskTableRowProps = {
  diskData: MigrationDisksTableData;
  rowIndex: number;
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedPVCs: Dispatch<SetStateAction<IoK8sApiCoreV1PersistentVolumeClaim[]>>;
  singleVMView?: boolean;
};

const VMDiskTableRow: FC<VMDiskTableRowProps> = ({
  diskData,
  rowIndex,
  selectedPVCs,
  setSelectedPVCs,
}) => (
  <Tr>
    <Td
      select={{
        isDisabled: !diskData.isSelectable,
        isSelected: Boolean(selectedPVCs.find((pvc) => getName(pvc) === getName(diskData.pvc))),
        onSelect: (_event, isSelecting) =>
          setSelectedPVCs((selection) =>
            isSelecting
              ? [...selection, diskData.pvc]
              : selection.filter((pvc) => getName(pvc) !== getName(diskData.pvc)),
          ),
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
