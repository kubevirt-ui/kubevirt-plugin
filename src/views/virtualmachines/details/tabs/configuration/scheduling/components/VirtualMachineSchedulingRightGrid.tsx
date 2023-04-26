import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategyModal/EvictionStrategyModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';
import VirtualMachineDescriptionItem from '@virtualmachines/details/tabs/details/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import DedicatedResources from './DedicatedResources';
import EvictionStrategy from './EvictionStrategy';

type VirtualMachineSchedulingRightGridProps = {
  vm: V1VirtualMachine;
  canUpdateVM: boolean;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachineSchedulingRightGrid: React.FC<VirtualMachineSchedulingRightGridProps> = ({
  vm,
  canUpdateVM,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const onSubmit = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: updatedVM,
        ns: updatedVM?.metadata?.namespace,
        name: updatedVM?.metadata?.name,
      }),
    [],
  );

  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          descriptionData={<DedicatedResources vm={vm} />}
          descriptionHeader={t('Dedicated resources')}
          isEdit={canUpdateVM}
          isDisabled={!isEmpty(vm?.spec?.instancetype)}
          messageOnDisabled={t(
            'Can not configure dedicated resources if the VirtualMachine is created from InstanceType',
          )}
          data-test-id="dedicated-resources"
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DedicatedResourcesModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                headerText={t('Dedicated resources')}
                vmi={vmi}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={<EvictionStrategy vm={vm} />}
          descriptionHeader={t('Eviction strategy')}
          isEdit={canUpdateVM}
          data-test-id="eviction-strategy"
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <EvictionStrategyModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                headerText={t('Eviction strategy')}
                vmi={vmi}
              />
            ))
          }
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineSchedulingRightGrid;
