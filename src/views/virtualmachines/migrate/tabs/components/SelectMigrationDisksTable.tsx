import React, { Dispatch, FC, SetStateAction } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { columnNames } from './constants';
import { getTableDiskData } from './utils';

type SelectMigrationDisksTableProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedPVCs: Dispatch<SetStateAction<IoK8sApiCoreV1PersistentVolumeClaim[]>>;
  vm: V1VirtualMachine;
};

const SelectMigrationDisksTable: FC<SelectMigrationDisksTableProps> = ({
  pvcs,
  selectedPVCs,
  setSelectedPVCs,
  vm,
}) => {
  const tableData = getVolumes(vm)?.map((volume) => getTableDiskData(vm, volume, pvcs));

  const selectableData = tableData.filter((data) => data.isSelectable);

  return (
    <Table aria-label="Selectable table">
      <Thead>
        <Tr>
          <Th
            select={{
              isSelected: selectedPVCs?.length === selectableData.length,
              onSelect: (_event, isSelecting) =>
                setSelectedPVCs(isSelecting ? selectableData.map((data) => data.pvc) : []),
            }}
            aria-label="Row select"
          />
          <Th>{columnNames.name}</Th>
          <Th>{columnNames.drive}</Th>
          <Th>{columnNames.storageClass}</Th>
          <Th>{columnNames.size}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {tableData.map((diskData, rowIndex) => (
          <Tr key={diskData.name}>
            <Td
              select={{
                isDisabled: !diskData.isSelectable,
                isSelected: Boolean(
                  selectedPVCs.find((pvc) => getName(pvc) === getName(diskData.pvc)),
                ),
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
        ))}
      </Tbody>
    </Table>
  );
};

export default SelectMigrationDisksTable;
