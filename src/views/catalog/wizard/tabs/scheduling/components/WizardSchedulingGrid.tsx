import * as React from 'react';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import DeschedulerModal from '@kubevirt-utils/components/DeschedulerModal/DeschedulerModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategyModal/EvictionStrategyModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { useDeschedulerInstalled } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { WizardDescriptionItem } from '../../../components/WizardDescriptionItem';

import Affinity from './Affinity';
import DedicatedResources from './DedicatedResources';
import Descheduler from './Descheduler';
import EvictionStrategy from './EvictionStrategy';
import NodeSelector from './NodeSelector';
import Tolerations from './Tolerations';

type WizardSchedulingGridProps = {
  vm: V1VirtualMachine;
  updateVM: UpdateValidatedVM;
};

const WizardSchedulingGrid: React.FC<WizardSchedulingGridProps> = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const isDeschedulerInstalled = useDeschedulerInstalled();
  const isAdmin = useIsAdmin();
  const isDeschedulerEditable = isAdmin && isDeschedulerInstalled;

  return (
    <Grid hasGutter className="wizard-scheduling-tab__grid">
      <GridItem span={6} rowSpan={4}>
        <DescriptionList>
          <WizardDescriptionItem
            title={t('Node selector')}
            description={<NodeSelector vm={vm} />}
            isEdit
            testId="node-selector"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <NodeSelectorModal
                  vm={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  nodes={nodes}
                  nodesLoaded={nodesLoaded}
                />
              ))
            }
          />

          <WizardDescriptionItem
            description={<Tolerations vm={vm} />}
            title={t('Tolerations')}
            isEdit
            testId="tolerations"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <TolerationsModal
                  vm={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  nodes={nodes}
                  nodesLoaded={nodesLoaded}
                />
              ))
            }
          />

          <WizardDescriptionItem
            title={t('Affinity rules')}
            description={<Affinity vm={vm} />}
            testId="affinity-rules"
            isEdit
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <AffinityModal
                  vm={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  nodes={nodes}
                  nodesLoaded={nodesLoaded}
                />
              ))
            }
          />

          <WizardDescriptionItem
            title={t('Descheduler')}
            description={<Descheduler vm={vm} />}
            isEdit={isDeschedulerEditable}
            testId="descheduler"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <DeschedulerModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={updateVM} />
              ))
            }
          />
        </DescriptionList>
      </GridItem>

      <GridItem span={6} rowSpan={4}>
        <DescriptionList>
          <WizardDescriptionItem
            title={t('Dedicated resources')}
            description={<DedicatedResources vm={vm} />}
            isEdit
            testId="dedicated-resources"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <DedicatedResourcesModal
                  vm={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  headerText={t('Dedicated resources')}
                />
              ))
            }
          />

          <WizardDescriptionItem
            title={t('Eviction strategy')}
            description={<EvictionStrategy vm={vm} />}
            isEdit
            testId="eviction-strategy"
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <EvictionStrategyModal
                  vm={vm}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  headerText={t('Eviction strategy')}
                />
              ))
            }
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default WizardSchedulingGrid;
