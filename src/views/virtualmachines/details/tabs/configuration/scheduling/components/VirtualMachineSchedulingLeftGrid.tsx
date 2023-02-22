import * as React from 'react';
import { Trans } from 'react-i18next';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import DeschedulerModal from '@kubevirt-utils/components/DeschedulerModal/DeschedulerModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import Tolerations from '@kubevirt-utils/components/Tolerations/Tolerations';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { useDeschedulerInstalled } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';
import VirtualMachineDescriptionItem from '@virtualmachines/details/tabs/details/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import Affinity from './Affinity';
import Descheduler from './Descheduler';
import NodeSelector from './NodeSelector';

type VirtualMachineSchedulingLeftGridProps = {
  vm: V1VirtualMachine;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  canUpdateVM: boolean;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachineSchedulingLeftGrid: React.FC<VirtualMachineSchedulingLeftGridProps> = ({
  vm,
  nodes,
  nodesLoaded,
  canUpdateVM,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const isLiveMigratableNotFalse = !!vm?.status?.conditions?.find(
    ({ type, status }) => type === 'LiveMigratable' && status !== 'False',
  );

  const isDeschedulerInstalled = useDeschedulerInstalled();
  const isAdmin = useIsAdmin();
  const isDeschedulerEditable = isAdmin && isDeschedulerInstalled && isLiveMigratableNotFalse;

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
          descriptionHeader={t('Node selector')}
          isEdit={canUpdateVM}
          data-test-id="node-selector"
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <NodeSelectorModal
                vm={vm}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vmi={vmi}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Tolerations vm={vm} />}
          descriptionHeader={t('Tolerations')}
          isEdit={canUpdateVM}
          data-test-id="tolerations"
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <TolerationsModal
                vm={vm}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vmi={vmi}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Affinity vm={vm} />}
          descriptionHeader={t('Affinity rules')}
          isEdit={canUpdateVM}
          data-test-id="affinity-rules"
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <AffinityModal
                vm={vm}
                nodes={nodes}
                nodesLoaded={nodesLoaded}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vmi={vmi}
              />
            ))
          }
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Descheduler vm={vm} />}
          descriptionHeader={t('Descheduler')}
          isEdit={isDeschedulerEditable}
          data-test-id="descheduler"
          isPopover
          bodyContent={
            <Trans t={t} ns="plugin__kubevirt-plugin">
              <p>
                The descheduler can be used to evict a running pod to allow the pod to be
                rescheduled onto a more suitable node.
              </p>
              <br />
              <p>Note: if VirtualMachine has LiveMigratable=False condition, edit is disabled.</p>
            </Trans>
          }
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DeschedulerModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vmi={vmi}
              />
            ))
          }
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineSchedulingLeftGrid;
