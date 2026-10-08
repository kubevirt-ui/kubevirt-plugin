import { type FC, useCallback } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import { produceVMWithDedicatedCPU } from '@kubevirt-utils/components/DedicatedResourcesModal/utils/utils';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import ShowEvictionStrategy from '@kubevirt-utils/components/EvictionStrategy/ShowEvictionStrategy';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import RunStrategyModal from '@kubevirt-utils/components/RunStrategyModal/RunStrategyModal';
import {
  getRunStrategyDisplayValue,
  getRunStrategyHelpText,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isExpandableSpecVM } from '@kubevirt-utils/resources/instancetype/helper';
import { getCPU, getEvictionStrategy } from '@kubevirt-utils/resources/vm';
import {
  getEffectiveRunStrategy,
  isVMNotStopped,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import useSchedulingSectionCallbacks from '../hooks/useSchedulingSectionCallbacks';
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

  const { onSubmit, onSubmitRunStrategy } = useSchedulingSectionCallbacks({ onUpdateVM, vm });

  const onEditEvictionStrategy = useCallback(() => {
    createModal?.(({ isOpen, onClose }) => (
      <EvictionStrategyModal
        headerText={t('Eviction strategy')}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        vm={vm}
        vmi={vmi}
      />
    ));
  }, [createModal, onSubmit, t, vm, vmi]);

  return (
    <GridItem span={5}>
      <DescriptionList>
        <DescriptionItem
          data-test="dedicated-resources"
          descriptionData={<DedicatedResources vm={isExpandableSpecVM(vm) ? instanceTypeVM : vm} />}
          descriptionHeader={
            <SearchItem id="dedicated-resources">{t('Dedicated resources')}</SearchItem>
          }
          isDisabled={isExpandableSpecVM(vm)}
          isEdit={canUpdateVM}
          messageOnDisabled={t(
            'Can not configure dedicated resources if the VirtualMachine is created from an instance type',
          )}
          onEditClick={() =>
            createModal?.(({ isOpen, onClose }) => (
              <DedicatedResourcesModal
                initialChecked={!!getCPU(vm)?.dedicatedCpuPlacement}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                produceUpdatedResource={(checked) => produceVMWithDedicatedCPU(vm, checked)}
                showPendingChangesAlert={!!vmi}
              />
            ))
          }
        />
        <DescriptionItem
          data-test="eviction-strategy"
          descriptionData={
            <ShowEvictionStrategy
              cluster={getCluster(vm)}
              evictionStrategy={getEvictionStrategy(vm)}
            />
          }
          descriptionHeader={
            <SearchItem id="eviction-strategy">{t('Eviction strategy')}</SearchItem>
          }
          isEdit={canUpdateVM}
          onEditClick={onEditEvictionStrategy}
        />
        <DescriptionItem
          bodyContent={getRunStrategyHelpText(t)}
          data-test="run-strategy"
          descriptionData={
            getRunStrategyDisplayValue(t, vm) ?? <MutedTextSpan text={t('Not available')} />
          }
          descriptionHeader={<SearchItem id="run-strategy">{t('Run strategy')}</SearchItem>}
          isEdit={canUpdateVM}
          isPopover
          onEditClick={() =>
            createModal?.(({ isOpen, onClose }) => (
              <RunStrategyModal
                initialRunStrategy={getEffectiveRunStrategy(vm)}
                isOpen={isOpen}
                isVMRunning={isVMNotStopped(vm)}
                onClose={onClose}
                onSubmit={onSubmitRunStrategy}
              />
            ))
          }
        />
      </DescriptionList>
    </GridItem>
  );
};

export default SchedulingSectionRightGrid;
