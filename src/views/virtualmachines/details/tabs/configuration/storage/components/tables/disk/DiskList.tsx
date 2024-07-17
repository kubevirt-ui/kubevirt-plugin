import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import DiskSourceFlyoutMenu from '@kubevirt-utils/components/DiskSourceFlyoutMenu/DiskSourceFlyoutMenu';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import useProvisioningPercentage from '@kubevirt-utils/resources/vm/hooks/useProvisioningPercentage';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import useDiskColumns from '../../hooks/useDiskColumns';
import useDisksFilters from '../../hooks/useDisksFilters';

import DiskRow from './DiskRow';

import './disklist.scss';

type DiskListProps = {
  customize?: boolean;
  onDiskUpdate?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DiskList: FC<DiskListProps> = ({ customize = false, onDiskUpdate, vm, vmi }) => {
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, loaded, loadError] = useDisksTableData(vm, vmi);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  const { percentages: provisioningPercentages } = useProvisioningPercentage(vm);

  const onSubmit = onDiskUpdate || updateDisks;

  return (
    <div className="kv-configuration-vm-disk-list">
      <DiskListTitle />
      <DiskSourceFlyoutMenu
        onSelect={(diskSource: SourceTypes) => {
          return createModal(({ isOpen, onClose }) => (
            <DiskModal
              createDiskSource={diskSource}
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={onDiskUpdate || updateDisks}
              vm={vm}
            />
          ));
        }}
      />
      <Flex>
        <FlexItem>
          <ListPageFilter
            data={data}
            hideLabelFilter
            loaded={loaded}
            onFilterChange={onFilterChange}
            rowFilters={filters}
          />
        </FlexItem>

        <FlexItem>
          <WindowsDrivers updateVM={onSubmit} vm={vm} />
        </FlexItem>
      </Flex>
      <VirtualizedTable
        columns={columns}
        data={filteredData}
        loaded={loaded}
        loadError={loadError}
        Row={DiskRow}
        rowData={{ customize, onSubmit, provisioningPercentages, vm, vmi }}
        unfilteredData={data}
      />
    </div>
  );
};

export default DiskList;
