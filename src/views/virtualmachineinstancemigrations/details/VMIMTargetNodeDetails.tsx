import React, { FC } from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NodeLink from '@kubevirt-utils/components/NodeLink/NodeLink';
import { getMigrationTargetNode } from '@kubevirt-utils/resources/vmim/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import { DetailsItemComponentProps } from '@openshift-console/dynamic-plugin-sdk';

const VMIMTargetNodeDetails: FC<DetailsItemComponentProps<V1VirtualMachineInstanceMigration>> = ({
  obj: vmim,
}) => {
  return <NodeLink cluster={getCluster(vmim)} nodeName={getMigrationTargetNode(vmim)} />;
};

export default VMIMTargetNodeDetails;
