import React, { FC } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { asAccessReview, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';
import { observer } from '@patternfly/react-topology';

import { VMNode } from '../utils/types/types';

import VMDetailsList from './vm/VMDetailsList/VMDetailsList';
import VMResourceSummary from './vm/VMResourceSummary';

type TopologyVmDetailsPanelProps = {
  vmNode: VMNode;
};

const TopologyVMDetailsPanel: FC<TopologyVmDetailsPanelProps> = observer(({ vmNode }) => {
  const vmData = vmNode.getData();
  const vmObj = vmData.resource as V1VirtualMachine;
  const { pods } = useVMIAndPodsForVM(getName(vmObj), getNamespace(vmObj));
  const { vmi } = vmData.data;
  const canUpdate =
    useAccessReview(asAccessReview(VirtualMachineModel, vmObj || {}, 'patch')) && !!vmObj;
  return (
    <div className="overview__sidebar-pane-body resource-overview__body">
      <Grid hasGutter>
        <GridItem span={6}>
          <VMResourceSummary
            canUpdateVM={canUpdate}
            kindObj={VirtualMachineModel}
            vm={vmObj}
            vmi={vmi}
          />
        </GridItem>
        <GridItem span={6}>
          <VMDetailsList
            canUpdateVM={canUpdate}
            kindObj={VirtualMachineModel}
            pods={pods as IoK8sApiCoreV1Pod[]}
            vm={vmObj}
            vmi={vmi}
          />
        </GridItem>
      </Grid>
    </div>
  );
});

export default TopologyVMDetailsPanel;
