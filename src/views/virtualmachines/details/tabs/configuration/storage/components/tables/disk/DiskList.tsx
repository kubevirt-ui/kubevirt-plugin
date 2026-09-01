import React, { type FC, type ReactNode, useMemo } from 'react';

import { DataVolumeModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { type SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineSubresourcesModel } from '@kubevirt-utils/models';
import { asAccessReview, getNamespace } from '@kubevirt-utils/resources/shared';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import useProvisioningPercentage from '@kubevirt-utils/resources/vm/hooks/useProvisioningPercentage';
import { type DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { type K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import useDisksFilters from '../../hooks/useDisksFilters';
import { type DiskListCallbacks, getDiskListColumns, getDiskRowId } from './diskListDefinition';

import './disklist.scss';

type DiskListProps = {
  afterTitle?: ReactNode;
  customize?: boolean;
  onDiskUpdate?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DiskList: FC<DiskListProps> = ({ afterTitle, customize = false, onDiskUpdate, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isWindowsSupported = useIsWindowsSupportedArchitecture();
  const columns = useMemo(() => getDiskListColumns(t), [t]);
  const [disks, sourcesLoaded, loadError] = useDisksTableData(vm, vmi) as [
    DiskRowDataLayout[],
    boolean,
    unknown,
    V1VirtualMachineInstance,
  ];
  const filterDefinitions = useDisksFilters();
  const { clearAllFilters, filteredData, filters, onSetFilters } =
    useKubevirtDataViewFilters<DiskRowDataLayout>({
      data: disks ?? [],
      filterDefinitions,
      hideLabelFilter: true,
    });

  const addVolumeAccessReview = asAccessReview(
    VirtualMachineSubresourcesModel,
    vm,
    'update' as K8sVerb,
    'addvolume',
  );
  const [canAddVolume] = useFleetAccessReview(addVolumeAccessReview ?? {});
  const vmIsRunning = isRunning(vm);

  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdate] = useFleetAccessReview(accessReview ?? {});

  const canHotplug = vmIsRunning && canAddVolume;
  const canAddDisk = canUpdate || canHotplug;

  const [canCreateDataVolume] = useAccessReview({
    group: DataVolumeModel.apiGroup,
    namespace: getNamespace(vm),
    resource: DataVolumeModel.plural,
    verb: 'create' as K8sVerb,
  });

  const { percentages: provisioningPercentages } = useProvisioningPercentage(vm);

  const onSubmit = onDiskUpdate ?? updateDisks;

  const callbacks: DiskListCallbacks = useMemo(
    () => ({
      customize,
      onSubmit,
      provisioningPercentages,
      sourcesLoaded,
      vm,
      vmi,
    }),
    [customize, onSubmit, provisioningPercentages, sourcesLoaded, vm, vmi],
  );

  return (
    <div className="kv-configuration-vm-disk-list">
      <DiskListTitle />
      {afterTitle}
      <DiskSourceSelect
        canCreateDataVolume={canCreateDataVolume}
        canUpdate={canAddDisk}
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
      />
      <Flex>
        <FlexItem>
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            data={disks}
            filterDefinitions={filterDefinitions}
            filters={filters}
            hideLabelFilter
            loaded={sourcesLoaded}
            onSetFilters={onSetFilters}
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
        unfilteredData={disks}
      />
    </div>
  );
};

export default DiskList;
