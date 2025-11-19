import React, { Dispatch, FC, SetStateAction, useMemo } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import { columnNames } from './constants';
import SelectMigrationDisksTableRow from './SelectMigrationDisksTableRow';
import { getTableDiskData } from './utils';

type SelectMigrationDisksTableProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedPVCs: Dispatch<SetStateAction<IoK8sApiCoreV1PersistentVolumeClaim[]>>;
  vms: V1VirtualMachine[];
};

const SelectMigrationDisksTable: FC<SelectMigrationDisksTableProps> = ({
  pvcs,
  selectedPVCs,
  setSelectedPVCs,
  vms,
}) => {
  const tableData = useMemo(() => getTableDiskData(vms, pvcs), [vms, pvcs]);

  const selectableData = tableData.filter((data) => data.isSelectable);

  const singleVMView = vms.length === 1;
  return (
    <Table aria-label="Selectable table">
      <Thead>
        <Tr>
          {!singleVMView && <Th aria-label="Expand" />}
          <Th
            select={{
              isSelected: selectedPVCs?.length === selectableData.length,
              onSelect: (_event, isSelecting) =>
                setSelectedPVCs(isSelecting ? selectableData.map((data) => data.pvc) : []),
            }}
            aria-label="Row select"
          />
          {!singleVMView && <Th>{columnNames.vmName}</Th>}
          <Th>{columnNames.name}</Th>
          <Th>{columnNames.drive}</Th>
          <Th>{columnNames.storageClass}</Th>
          {singleVMView && <Th>{columnNames.size}</Th>}
        </Tr>
      </Thead>
      {tableData.map((diskData, rowIndex) => (
        <SelectMigrationDisksTableRow
          diskData={diskData}
          key={getName(diskData.pvc)}
          rowIndex={rowIndex}
          selectedPVCs={selectedPVCs}
          setSelectedPVCs={setSelectedPVCs}
          singleVMView={singleVMView}
        />
      ))}
    </Table>
  );
};

export default SelectMigrationDisksTable;
