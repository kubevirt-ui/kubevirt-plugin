import React, { FC } from 'react';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';

import useVMNetworkActions from './hooks/useVMNetworkActions';

type VMNetworkActionProps = {
  isKebabToggle?: boolean;
  obj: ClusterUserDefinedNetworkKind;
};

const VMNetworkActions: FC<VMNetworkActionProps> = ({ isKebabToggle = true, obj }) => {
  const actions = useVMNetworkActions(obj);

  return (
    <ActionsDropdown actions={actions} id="vm-network-actions" isKebabToggle={isKebabToggle} />
  );
};

export default VMNetworkActions;
