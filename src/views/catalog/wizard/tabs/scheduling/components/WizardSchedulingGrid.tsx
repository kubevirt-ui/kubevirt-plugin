import * as React from 'react';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategyModal/EvictionStrategyModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
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
  updateVM: UpdateValidatedVM;
  vm: V1VirtualMachine;
};

const WizardSchedulingGrid: React.FC<WizardSchedulingGridProps> = ({ updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  return (
    <Grid className="wizard-scheduling-tab__grid" hasGutter>
      <GridItem rowSpan={4} span={6}>
        <DescriptionList>
          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <NodeSelectorModal
                  isOpen={isOpen}
                  nodes={nodes}
                  nodesLoaded={nodesLoaded}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ))
            }
            description={<NodeSelector vm={vm} />}
            isEdit
            testId="node-selector"
            title={t('Node selector')}
          />

          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <TolerationsModal
                  isOpen={isOpen}
                  nodes={nodes}
                  nodesLoaded={nodesLoaded}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ))
            }
            description={<Tolerations vm={vm} />}
            isEdit
            testId="tolerations"
            title={t('Tolerations')}
          />

          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <AffinityModal
                  isOpen={isOpen}
                  nodes={nodes}
                  nodesLoaded={nodesLoaded}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ))
            }
            description={<Affinity vm={vm} />}
            isEdit
            testId="affinity-rules"
            title={t('Affinity rules')}
          />

          <WizardDescriptionItem
            description={<Descheduler vm={vm} />}
            testId="descheduler"
            title={t('Descheduler')}
          />
        </DescriptionList>
      </GridItem>

      <GridItem rowSpan={4} span={6}>
        <DescriptionList>
          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <DedicatedResourcesModal
                  headerText={t('Dedicated resources')}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ))
            }
            description={<DedicatedResources vm={vm} />}
            isEdit
            testId="dedicated-resources"
            title={t('Dedicated resources')}
          />

          <WizardDescriptionItem
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <EvictionStrategyModal
                  headerText={t('Eviction strategy')}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ))
            }
            description={<EvictionStrategy vm={vm} />}
            isEdit
            testId="eviction-strategy"
            title={t('Eviction strategy')}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default WizardSchedulingGrid;
