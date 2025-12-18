import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useInstanceTypeExpandSpec from '@kubevirt-utils/resources/vm/hooks/useInstanceTypeExpandSpec';
import { Grid, GridItem } from '@patternfly/react-core';
import { observer } from '@patternfly/react-topology';
import { VMNode } from '@topology/utils/types/types';

import VMDetailsPanelLeftColumn from './components/VMDetailsPanelLeftColumn/VMDetailsPanelLeftColumn';
import VMDetailsPanelRightColumn from './components/VMDetailsPanelRightColumn/VMDetailsPanelRightColumn';

type TopologyVMDetailsPanelProps = {
  vmNode: VMNode;
};

const TopologyVMDetailsPanel: FC<TopologyVMDetailsPanelProps> = observer(({ vmNode }) => {
  const vmData = vmNode.getData();
  const vm = vmData.resource as V1VirtualMachine;
  const { vmi } = vmData?.data;
  const [instanceTypeExpandedSpec] = useInstanceTypeExpandSpec(vm);
  return (
    <div className="overview__sidebar-pane-body resource-overview__body">
      <Grid hasGutter>
        <GridItem span={6}>
          <VMDetailsPanelLeftColumn vm={vm} vmi={vmi} />
        </GridItem>
        <GridItem span={6}>
          <VMDetailsPanelRightColumn instanceTypeVM={instanceTypeExpandedSpec} vm={vm} vmi={vmi} />
        </GridItem>
      </Grid>
    </div>
  );
});

export default TopologyVMDetailsPanel;
