import React, { FC, useState } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { Table, TableGridBreakpoint, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { MigrationDisksTableData } from '../../utils/diskData';

import { columnNames } from './constants';
import VMDiskTableRow from './VMDiskTableRow';

type SelectMigrationDisksTableRowProps = {
  diskData: MigrationDisksTableData;
  rowIndex: number;
  selectDiskData: (diskData: MigrationDisksTableData, isSelected: boolean) => void;
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  singleVMView?: boolean;
};

const SelectMigrationDisksTableRow: FC<SelectMigrationDisksTableRowProps> = ({
  diskData,
  rowIndex,
  selectDiskData,
  selectedPVCs,
  singleVMView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (singleVMView)
    return (
      <VMDiskTableRow
        diskData={diskData}
        rowIndex={rowIndex}
        selectDiskData={selectDiskData}
        selectedPVCs={selectedPVCs}
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
            onSelect: (_event, isSelecting) => selectDiskData(diskData, isSelecting),
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
