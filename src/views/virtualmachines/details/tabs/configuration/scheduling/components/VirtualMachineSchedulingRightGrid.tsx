import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategyModal/EvictionStrategyModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import DedicatedResources from './DedicatedResources';
import EvictionStrategy from './EvictionStrategy';

type VirtualMachineSchedulingRightGridProps = {
  canUpdateVM: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachineSchedulingRightGrid: React.FC<VirtualMachineSchedulingRightGridProps> = ({
  canUpdateVM,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const onSubmit = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        data: updatedVM,
        model: VirtualMachineModel,
        name: updatedVM?.metadata?.name,
        ns: updatedVM?.metadata?.namespace,
      }),
    [],
  );

  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          messageOnDisabled={t(
            'Can not configure dedicated resources if the VirtualMachine is created from InstanceType',
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
          descriptionData={<DedicatedResources vm={vm} />}
          descriptionHeader={t('Dedicated resources')}
          isDisabled={!isEmpty(vm?.spec?.instancetype)}
          isEdit={canUpdateVM}
        />
        <VirtualMachineDescriptionItem
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
          descriptionData={<EvictionStrategy vm={vm} />}
          descriptionHeader={t('Eviction strategy')}
          isEdit={canUpdateVM}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineSchedulingRightGrid;
