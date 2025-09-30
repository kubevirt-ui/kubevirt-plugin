import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { Table, TableGridBreakpoint, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { columnNames } from './constants';
import { MigrationDisksTableData } from './utils';
import VMDiskTableRow from './VMDiskTableRow';

type SelectMigrationDisksTableRowProps = {
  diskData: MigrationDisksTableData;
  rowIndex: number;
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedPVCs: Dispatch<SetStateAction<IoK8sApiCoreV1PersistentVolumeClaim[]>>;
  singleVMView?: boolean;
};

const SelectMigrationDisksTableRow: FC<SelectMigrationDisksTableRowProps> = ({
  diskData,
  rowIndex,
  selectedPVCs,
  setSelectedPVCs,
  singleVMView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (singleVMView)
    return (
      <VMDiskTableRow
        diskData={diskData}
        rowIndex={rowIndex}
        selectedPVCs={selectedPVCs}
        setSelectedPVCs={setSelectedPVCs}
      />
    );

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          expand={{
            expandId: 'expand-disk-migration-table',
            isExpanded,
            onToggle: (_, __, isOpen) => setIsExpanded(isOpen),
            rowIndex,
          }}
        />
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
        <Td dataLabel={columnNames.vmName}>{getName(diskData.vm)}</Td>
        <Td dataLabel={columnNames.name}>{diskData.name}</Td>
        <Td dataLabel={columnNames.drive}>{diskData.drive}</Td>
        <Td dataLabel={columnNames.storageClass}>{diskData.storageClass}</Td>
      </Tr>

      <Tr className={`disk-migration-table__expanded-${isExpanded}`} isExpanded={isExpanded}>
        <Td colSpan={3}>
          <Table
            className="disk-details-table"
            gridBreakPoint={TableGridBreakpoint.none}
            role="presentation"
          >
            <Thead>
              <Tr>
                <Th key={columnNames.size}>{columnNames.size}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td dataLabel={columnNames.size}>{readableSizeUnit(diskData?.size)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default SelectMigrationDisksTableRow;
