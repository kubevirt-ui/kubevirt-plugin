import React, { FC, useCallback } from 'react';
import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import ShowEvictionStrategy from '@kubevirt-utils/components/EvictionStrategy/ShowEvictionStrategy';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import RunStrategyModal from '@kubevirt-utils/components/RunStrategyModal/RunStrategyModal';
import {
  applyRunStrategyToSpec,
  getRunStrategyDisplayValue,
  getRunStrategyHelpText,
  updateRunStrategy,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isExpandableSpecVM } from '@kubevirt-utils/resources/instancetype/helper';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getEvictionStrategy } from '@kubevirt-utils/resources/vm';
import {
  getEffectiveRunStrategy,
  isVMNotStopped,
} from '@kubevirt-utils/resources/vm/utils/selectors';
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
    [onUpdateVM, vm],
  );

  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
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
        <VirtualMachineDescriptionItem
          descriptionHeader={
            <SearchItem id="eviction-strategy">{t('Eviction strategy')}</SearchItem>
          }
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <EvictionStrategyModal
                headerText={t('Eviction strategy')}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id="eviction-strategy"
          descriptionData={<ShowEvictionStrategy evictionStrategy={getEvictionStrategy(vm)} />}
          isEdit={canUpdateVM}
        />
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <RunStrategyModal
                onSubmit={(runStrategy) =>
                  onUpdateVM
                    ? onUpdateVM(
                        produce(vm, (draft) => applyRunStrategyToSpec(draft.spec, runStrategy)),
                      )
                    : updateRunStrategy(vm, runStrategy)
                }
                initialRunStrategy={getEffectiveRunStrategy(vm)}
                isOpen={isOpen}
                isVMRunning={isVMNotStopped(vm)}
                onClose={onClose}
              />
            ))
          }
          bodyContent={getRunStrategyHelpText(t)}
          data-test-id="run-strategy"
          descriptionData={getRunStrategyDisplayValue(t, vm)}
          descriptionHeader={<SearchItem id="run-strategy">{t('Run strategy')}</SearchItem>}
          isEdit={canUpdateVM}
          isPopover
        />
      </DescriptionList>
    </GridItem>
  );
};

export default SchedulingSectionRightGrid;
