import React, { FC } from 'react';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import ShowEvictionStrategy from '@kubevirt-utils/components/EvictionStrategy/ShowEvictionStrategy';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorDetailItem from '@kubevirt-utils/components/NodeSelectorDetailItem/NodeSelectorDetailItem';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import RunStrategyModal from '@kubevirt-utils/components/RunStrategyModal/RunStrategyModal';
import {
  applyRunStrategyToSpec,
  getRunStrategyDisplayValue,
  getRunStrategyHelpText,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEvictionStrategy } from '@kubevirt-utils/resources/vm';
import { getEffectiveRunStrategy } from '@kubevirt-utils/resources/vm/utils/selectors';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { WizardDescriptionItem } from '../../../components/WizardDescriptionItem';

import Affinity from './Affinity';
import DedicatedResources from './DedicatedResources';
import Descheduler from './Descheduler';
import DeschedulerPopover from './DeschedulerPopover';
import Tolerations from './Tolerations';

type WizardSchedulingGridProps = {
  updateVM: UpdateValidatedVM;
  vm: V1VirtualMachine;
};

const WizardSchedulingGrid: FC<WizardSchedulingGridProps> = ({ updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  return (
    <Grid className="wizard-scheduling-tab__grid" hasGutter>
      <GridItem rowSpan={4} span={6}>
        <DescriptionList>
          <WizardDescriptionItem
            description={
              <NodeSelectorDetailItem nodeSelector={vm?.spec?.template?.spec?.nodeSelector} />
            }
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
            helperPopover={{
              content: <DeschedulerPopover />,
              header: t('Descheduler'),
              olsObj: vm,
              olsPromptType: OLSPromptType.DESCHEDULER,
            }}
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
            description={
              <ShowEvictionStrategy
                cluster={getCluster(vm)}
                evictionStrategy={getEvictionStrategy(vm)}
              />
            }
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
            isEdit
            testId="eviction-strategy"
            title={t('Eviction strategy')}
          />

          <WizardDescriptionItem
            helperPopover={{
              content: getRunStrategyHelpText(t),
              header: t('Run strategy'),
            }}
            onEditClick={() =>
              createModal(({ isOpen, onClose }) => (
                <RunStrategyModal
                  onSubmit={(runStrategy) =>
                    updateVM((draftVM) => applyRunStrategyToSpec(draftVM.spec, runStrategy))
                  }
                  hasStoppedVMs={false}
                  initialRunStrategy={getEffectiveRunStrategy(vm)}
                  isOpen={isOpen}
                  isVMRunning={false}
                  onClose={onClose}
                />
              ))
            }
            description={getRunStrategyDisplayValue(t, vm) ?? t('Not available')}
            isEdit
            testId="wizard-scheduling-run-strategy"
            title={t('Run strategy')}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default WizardSchedulingGrid;
