import React, { FC } from 'react';

import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useClusterInstancetypeActionsProvider from './hooks/useClusterInstancetypeActionsProvider';

type ClusterInstancetypeActionsProps = {
  instanceType: V1beta1VirtualMachineClusterInstancetype;
  isKebabToggle?: boolean;
};

const ClusterInstancetypeActions: FC<ClusterInstancetypeActionsProps> = ({
  instanceType,
  isKebabToggle,
}) => {
  const [actions] = useClusterInstancetypeActionsProvider(instanceType);

  return (
    <ActionsDropdown
      actions={actions}
      id="virtual-machine-cluster-instance-type-actions"
      isKebabToggle={isKebabToggle}
    />
  );
};

export default ClusterInstancetypeActions;
