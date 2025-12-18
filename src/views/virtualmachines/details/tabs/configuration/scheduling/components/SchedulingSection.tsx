import React, { FC, memo } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import SchedulingSectionLeftGrid from './SchedulingSectionLeftGrid';
import SchedulingSectionRightGrid from './SchedulingSectionRightGrid';

type SchedulingSectionProps = {
  instanceTypeVM?: V1VirtualMachine;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SchedulingSection: FC<SchedulingSectionProps> = ({ instanceTypeVM, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useFleetAccessReview(accessReview || {});

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
          onUpdateVM={onSubmit}
          vm={vm}
          vmi={vmi}
        />
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <SchedulingSectionRightGrid
          canUpdateVM={canUpdateVM}
          instanceTypeVM={instanceTypeVM}
          onUpdateVM={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      </Grid>
    </>
  );
};

export default memo(SchedulingSection);
