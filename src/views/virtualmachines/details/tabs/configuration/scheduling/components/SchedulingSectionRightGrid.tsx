import React, { FC, useCallback, useMemo } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import ShowEvictionStrategy from '@kubevirt-utils/components/EvictionStrategy/ShowEvictionStrategy';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isExpandableSpecVM } from '@kubevirt-utils/resources/instancetype/helper';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getEvictionStrategy } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import DedicatedResources from './DedicatedResources';

type SchedulingSectionRightGridProps = {
  canUpdateVM: boolean;
  instanceTypeVM?: V1VirtualMachine;
  onUpdateVM?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SchedulingSectionRightGrid: FC<SchedulingSectionRightGridProps> = ({
  canUpdateVM,
  instanceTypeVM,
  onUpdateVM,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const onSubmit = useCallback(
    (updatedVM: V1VirtualMachine) =>
      onUpdateVM
        ? onUpdateVM(updatedVM)
        : kubevirtK8sUpdate({
            cluster: getCluster(vm),
            data: updatedVM,
            model: VirtualMachineModel,
            name: getName(updatedVM),
            ns: getNamespace(updatedVM),
          }),
    [onUpdateVM],
  );

  const onEditEvictionStrategy = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <EvictionStrategyModal
        headerText={t('Eviction strategy')}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        vm={vm}
        vmi={vmi}
      />
    ));
  }, [createModal, onSubmit, vm, vmi]);

  const evictionStrategy = useMemo(
    () => (
      <ShowEvictionStrategy cluster={getCluster(vm)} evictionStrategy={getEvictionStrategy(vm)} />
    ),
    [vm],
  );

  return (
    <GridItem span={5}>
      <DescriptionList>
        <DescriptionItem
          descriptionHeader={
            <SearchItem id="dedicated-resources">{t('Dedicated resources')}</SearchItem>
          }
          messageOnDisabled={t(
            'Can not configure dedicated resources if the VirtualMachine is created from Instance Type',
          )}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DedicatedResourcesModal
                headerText={t('Dedicated resources')}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id="dedicated-resources"
          descriptionData={<DedicatedResources vm={isExpandableSpecVM(vm) ? instanceTypeVM : vm} />}
          isDisabled={isExpandableSpecVM(vm)}
          isEdit={canUpdateVM}
        />
        <DescriptionItem
          descriptionHeader={
            <SearchItem id="eviction-strategy">{t('Eviction strategy')}</SearchItem>
          }
          data-test-id="eviction-strategy"
          descriptionData={evictionStrategy}
          isEdit={canUpdateVM}
          onEditClick={onEditEvictionStrategy}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default SchedulingSectionRightGrid;
