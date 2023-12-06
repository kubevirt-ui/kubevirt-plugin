import React, { FC } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import {
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, Title } from '@patternfly/react-core';

import SchedulingSectionLeftGrid from './SchedulingSectionLeftGrid';
import SchedulingSectionRightGrid from './SchedulingSectionRightGrid';

type SchedulingSectionProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const SchedulingSection: FC<SchedulingSectionProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});

  return (
    <>
      <Title headingLevel="h2">
        <SearchItem id="scheduling">{t('Scheduling and resource requirements')}</SearchItem>
      </Title>
      <Grid hasGutter>
        <SchedulingSectionLeftGrid
          canUpdateVM={canUpdateVM}
          nodes={nodes}
          nodesLoaded={nodesLoaded}
          vm={vm}
          vmi={vmi}
        />
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <SchedulingSectionRightGrid canUpdateVM={canUpdateVM} vm={vm} vmi={vmi} />
      </Grid>
    </>
  );
};

export default SchedulingSection;
