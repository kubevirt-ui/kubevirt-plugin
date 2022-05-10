import * as React from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
  vm: V1VirtualMachine;
  pathname: string;
};

const SchedulingSection: React.FC<SchedulingSectionProps> = ({ vm, pathname }) => {
  const { t } = useKubevirtTranslation();
  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});
  return (
    <div className="vm-scheduling-section">
      <a href={`${pathname}#scheduling`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('Scheduling and resources requirements')}
      </Title>
      <Grid hasGutter>
        <VirtualMachineSchedulingLeftGrid
          vm={vm}
          nodes={nodes}
          nodesLoaded={nodesLoaded}
          canUpdateVM={canUpdateVM}
        />
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <VirtualMachineSchedulingRightGrid vm={vm} canUpdateVM={canUpdateVM} />
      </Grid>
    </div>
  );
};

export default SchedulingSection;
