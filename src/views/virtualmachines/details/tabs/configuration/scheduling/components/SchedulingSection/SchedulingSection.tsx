import React, { FC } from 'react';

import {
  modelToGroupVersionKind,
  NodeModel,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import {
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import VirtualMachineSchedulingLeftGrid from '../VirtualMachineSchedulingLeftGrid';
import VirtualMachineSchedulingRightGrid from '../VirtualMachineSchedulingRightGrid';

import './SchedulingSection.scss';

type SchedulingSectionProps = {
  pathname: string;
  vm: V1VirtualMachine;
};

const SchedulingSection: FC<SchedulingSectionProps> = ({ pathname, vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });
  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});

  return (
    <div className="vm-scheduling-section">
      <a className="link-icon" href={`${pathname}#scheduling`}>
        <LinkIcon size="sm" />
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Scheduling and resource requirements')}
      </Title>
      <Grid hasGutter>
        <VirtualMachineSchedulingLeftGrid
          canUpdateVM={canUpdateVM}
          nodes={nodes}
          nodesLoaded={nodesLoaded}
          vm={vm}
          vmi={vmi}
        />
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <VirtualMachineSchedulingRightGrid canUpdateVM={canUpdateVM} vm={vm} vmi={vmi} />
      </Grid>
    </div>
  );
};

export default SchedulingSection;
