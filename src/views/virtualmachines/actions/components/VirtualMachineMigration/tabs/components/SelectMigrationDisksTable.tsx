import React, { FC, useCallback, useMemo } from 'react';
import { Updater } from 'use-immer';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import { SelectedMigration } from '../../utils/constants';
import {
  createSelectedMigration,
  getTableDiskData,
  MigrationDisksTableData,
} from '../../utils/diskData';

import { columnNames } from './constants';
import SelectMigrationDisksTableRow from './SelectMigrationDisksTableRow';

type SelectMigrationDisksTableProps = {
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  selectedPVCs: IoK8sApiCoreV1PersistentVolumeClaim[];
  setSelectedMigrations: Updater<SelectedMigration[]>;
  vms: V1VirtualMachine[];
};

const SelectMigrationDisksTable: FC<SelectMigrationDisksTableProps> = ({
  pvcs,
  selectedPVCs,
  setSelectedMigrations,
  vms,
}) => {
  const tableData = useMemo(() => getTableDiskData(vms, pvcs), [vms, pvcs]);

  const selectableData = tableData.filter((data) => data.isSelectable);

  const singleVMView = vms.length === 1;

  const selectDiskData = useCallback(
    (diskData: MigrationDisksTableData, isSelected: boolean) => {
      setSelectedMigrations((selection) =>
        isSelected
          ? [...selection, createSelectedMigration(diskData)]
          : selection.filter((migration) => getUID(migration.pvc) !== getUID(diskData.pvc)),
      );
    },
    [setSelectedMigrations],
  );

  return (
    <Table aria-label="Selectable table">
      <Thead>
        <Tr>
          {!singleVMView && <Th aria-label="Expand" />}
          <Th
            select={{
              isSelected: selectedPVCs?.length === selectableData.length,
              onSelect: (_event, isSelecting) =>
                setSelectedMigrations(
                  isSelecting
                    ? selectableData.map((data) => ({
                        pvc: data.pvc,
                        vmName: getName(data.vm),
                        vmNamespace: getNamespace(data.vm),
                        volumeName: data.name,
                      }))
                    : [],
                ),
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
          selectDiskData={selectDiskData}
          selectedPVCs={selectedPVCs}
          singleVMView={singleVMView}
        />
      ))}
    </Table>
  );
};

export default SelectMigrationDisksTable;
