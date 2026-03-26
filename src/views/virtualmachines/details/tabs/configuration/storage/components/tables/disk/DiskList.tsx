import React, { FC, useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import useProvisioningPercentage from '@kubevirt-utils/resources/vm/hooks/useProvisioningPercentage';
import {
  K8sVerb,
  ListPageFilter,
  useAccessReview,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import useDisksFilters from '../../hooks/useDisksFilters';

import { DiskListCallbacks, getDiskListColumns, getDiskRowId } from './diskListDefinition';

import './disklist.scss';

type DiskListProps = {
  customize?: boolean;
  onDiskUpdate?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  onUploadStarted?: (uploadPromise: Promise<unknown>) => void;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DiskList: FC<DiskListProps> = ({
  customize = false,
  onDiskUpdate,
  onUploadStarted,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isWindowsSupported = useIsWindowsSupportedArchitecture();
  const columns = useMemo(() => getDiskListColumns(t), [t]);
  const [disks, sourcesLoaded, loadError] = useDisksTableData(vm, vmi);
  const instanceTypeVMStore = useInstanceTypeVMStore();
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdate] = useFleetAccessReview(accessReview ?? {});

  const [canCreateDataVolume] = useAccessReview({
    group: VirtualMachineModel.apiGroup,
    namespace: instanceTypeVMStore?.vmNamespaceTarget,
    resource: VirtualMachineModel.plural,
    verb: 'create' as K8sVerb,
  });

  const { percentages: provisioningPercentages } = useProvisioningPercentage(vm);

  const onSubmit = onDiskUpdate ?? updateDisks;

  const callbacks: DiskListCallbacks = useMemo(
    () => ({
      customize,
      onSubmit,
      onUploadStarted,
      provisioningPercentages,
      sourcesLoaded,
      vm,
      vmi,
    }),
    [customize, onSubmit, onUploadStarted, provisioningPercentages, sourcesLoaded, vm, vmi],
  );

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
              onUploadStarted={onUploadStarted}
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
            loaded={sourcesLoaded}
            onFilterChange={onFilterChange}
            rowFilters={filters}
          />
        </FlexItem>

        {isWindowsSupported && (
          <FlexItem>
            <WindowsDrivers updateVM={onSubmit} vm={vm} />
          </FlexItem>
        )}
      </Flex>
      <KubevirtTable
        ariaLabel={t('Disks table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData}
        dataTest="vm-disk-list"
        fixedLayout
        getRowId={getDiskRowId}
        initialSortKey="name"
        loaded={sourcesLoaded}
        loadError={loadError}
        noDataMsg={t('No disks found')}
        noFilteredDataMsg={t('No results match the current filters')}
        unfilteredData={data}
      />
    </div>
  );
};

export default DiskList;
