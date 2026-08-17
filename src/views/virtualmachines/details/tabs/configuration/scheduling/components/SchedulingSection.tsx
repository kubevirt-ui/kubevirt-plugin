import React, { FC } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNodes from '@kubevirt-utils/hooks/useNodes';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, Title } from '@patternfly/react-core';

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
  const [nodes, nodesLoaded] = useNodes();
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

export default SchedulingSection;
