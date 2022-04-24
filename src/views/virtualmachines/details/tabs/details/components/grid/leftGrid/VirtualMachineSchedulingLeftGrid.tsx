import * as React from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import DeschedulerModal from '@kubevirt-utils/components/DeschedulerModal/DeschedulerModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import Tolerations from '@kubevirt-utils/components/Tolerations/Tolerations';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../../utils';
import Affinity from '../../Affinity/Affinity';
import Descheduler from '../../Descheduler/Descheduler';
import NodeSelector from '../../NodeSelector/NodeSelector';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

type VirtualMachineSchedulingLeftGridProps = {
  vm: V1VirtualMachine;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  canUpdateVM: boolean;
};

const VirtualMachineSchedulingLeftGrid: React.FC<VirtualMachineSchedulingLeftGridProps> = ({
  vm,
  nodes,
  nodesLoaded,
  canUpdateVM,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const canUpdateStoppedVM =
    canUpdateVM && vm?.status?.printableStatus === printableVMStatus.Stopped;

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
          descriptionData={<NodeSelector vm={vm} />}
          descriptionHeader={t('Node Selector')}
          isEdit={canUpdateStoppedVM}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <NodeSelectorModal
                vm={vm}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Tolerations vm={vm} />}
          descriptionHeader={t('Tolerations')}
          isEdit={canUpdateStoppedVM}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <TolerationsModal
                vm={vm}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Affinity vm={vm} />}
          descriptionHeader={t('Affinity Rules')}
          isEdit={canUpdateStoppedVM}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <AffinityModal
                vm={vm}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Descheduler vm={vm} />}
          descriptionHeader={t('Descheduler')}
          isEdit={canUpdateStoppedVM}
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DeschedulerModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} />
            ))
          }
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineSchedulingLeftGrid;
