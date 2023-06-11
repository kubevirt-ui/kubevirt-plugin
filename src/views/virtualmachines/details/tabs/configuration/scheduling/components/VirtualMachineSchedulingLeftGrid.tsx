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
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useDeschedulerInstalled } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import Affinity from './Affinity';
import Descheduler from './Descheduler';
import NodeSelector from './NodeSelector';

type VirtualMachineSchedulingLeftGridProps = {
  canUpdateVM: boolean;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VirtualMachineSchedulingLeftGrid: React.FC<VirtualMachineSchedulingLeftGridProps> = ({
  canUpdateVM,
  nodes,
  nodesLoaded,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const isLiveMigratableNotFalse = !!vm?.status?.conditions?.find(
    ({ status, type }) => type === 'LiveMigratable' && status !== 'False',
  );

  const isDeschedulerInstalled = useDeschedulerInstalled();
  const isAdmin = useIsAdmin();
  const isDeschedulerEditable = isAdmin && isDeschedulerInstalled && isLiveMigratableNotFalse;

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
          descriptionHeader={t('Node selector')}
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
          descriptionHeader={t('Tolerations')}
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
          descriptionHeader={t('Affinity rules')}
          isEdit={canUpdateVM}
        />
        <VirtualMachineDescriptionItem
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin" t={t}>
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
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id="descheduler"
          descriptionData={<Descheduler vm={vm} />}
          descriptionHeader={t('Descheduler')}
          isEdit={isDeschedulerEditable}
          isPopover
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineSchedulingLeftGrid;
