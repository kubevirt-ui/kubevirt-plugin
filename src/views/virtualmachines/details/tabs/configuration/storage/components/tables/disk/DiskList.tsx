import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import useProvisioningPercentage from '@kubevirt-utils/resources/vm/hooks/useProvisioningPercentage';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import {
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
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
  const [disks, sourcesLoaded, loadError] = useDisksTableData(vm, vmi);
  const instanceTypeVMStore = useInstanceTypeVMStore();
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdate] = useFleetAccessReview(accessReview || {});

  const [canCreateDataVolume] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: instanceTypeVMStore?.vmNamespaceTarget,
    resource: VirtualMachineModel.plural,
    verb: 'create' as K8sVerb,
  });

  const { percentages: provisioningPercentages } = useProvisioningPercentage(vm);

  const onSubmit = onDiskUpdate || updateDisks;

  return (
    <div className="kv-configuration-vm-disk-list">
      <DiskListTitle />
      <DiskSourceSelect
        onSelect={(diskSource: SourceTypes) => {
          return createModal(({ isOpen, onClose }) => (
            <DiskModal
              createDiskSource={diskSource}
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={onSubmit}
              vm={vm}
            />
          ));
        }}
        canCreateDataVolume={canCreateDataVolume}
        canUpdate={canUpdate}
      />
      <Flex>
        <FlexItem>
          <ListPageFilter
            data={data}
            hideLabelFilter
            loaded
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
        loaded
        loadError={loadError}
        Row={DiskRow}
        rowData={{ customize, onSubmit, provisioningPercentages, sourcesLoaded, vm, vmi }}
        unfilteredData={data}
      />
    </div>
  );
};

export default DiskList;
