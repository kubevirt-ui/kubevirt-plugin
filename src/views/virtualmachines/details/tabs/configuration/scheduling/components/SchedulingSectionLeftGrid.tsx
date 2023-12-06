import React, { FC, useCallback } from 'react';

import Descheduler from '@catalog/wizard/tabs/scheduling/components/Descheduler';
import DeschedulerPopover from '@catalog/wizard/tabs/scheduling/components/DeschedulerPopover';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import Tolerations from '@kubevirt-utils/components/Tolerations/Tolerations';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import Affinity from './Affinity';
import NodeSelector from './NodeSelector';

type SchedulingSectionLeftGridProps = {
  canUpdateVM: boolean;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SchedulingSectionLeftGrid: FC<SchedulingSectionLeftGridProps> = ({
  canUpdateVM,
  nodes,
  nodesLoaded,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const onSubmit = useCallback(
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
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <NodeSelectorModal
                isOpen={isOpen}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id="node-selector"
          descriptionData={<NodeSelector vm={vm} />}
          descriptionHeader={<SearchItem id="node-selector">{t('Node selector')}</SearchItem>}
          isEdit={canUpdateVM}
        />
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <TolerationsModal
                isOpen={isOpen}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id="tolerations"
          descriptionData={<Tolerations vm={vm} />}
          descriptionHeader={<SearchItem id="tolerations">{t('Tolerations')}</SearchItem>}
          isEdit={canUpdateVM}
        />
        <VirtualMachineDescriptionItem
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <AffinityModal
                isOpen={isOpen}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id="affinity-rules"
          descriptionData={<Affinity vm={vm} />}
          descriptionHeader={<SearchItem id="affinity">{t('Affinity rules')}</SearchItem>}
          isEdit={canUpdateVM}
        />
        <VirtualMachineDescriptionItem
          bodyContent={<DeschedulerPopover />}
          data-test-id="descheduler"
          descriptionData={<Descheduler vm={vm} />}
          descriptionHeader={<SearchItem id="descheduler">{t('Descheduler')}</SearchItem>}
          isPopover
        />
      </DescriptionList>
    </GridItem>
  );
};

export default SchedulingSectionLeftGrid;
