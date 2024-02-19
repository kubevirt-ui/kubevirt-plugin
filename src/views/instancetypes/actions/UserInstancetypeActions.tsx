import React, { FC } from 'react';

import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useUserInstancetypeActionsProvider from './hooks/useUserInstancetypeActionsProvider';

type UserInstancetypeActionsProps = {
  instanceType: V1beta1VirtualMachineInstancetype;
  isKebabToggle?: boolean;
};

const UserInstancetypeActions: FC<UserInstancetypeActionsProps> = ({
  instanceType,
  isKebabToggle,
}) => {
  const [actions] = useUserInstancetypeActionsProvider(instanceType);

  return (
    <ActionsDropdown
      actions={actions}
      id="virtual-machine-user-instance-type-actions"
      isKebabToggle={isKebabToggle}
    />
  );
};

export default UserInstancetypeActions;
