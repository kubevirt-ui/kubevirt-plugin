import React, { FC, memo } from 'react';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { Action } from '@openshift-console/dynamic-plugin-sdk';

import './VirtualMachineActions.scss';

type VirtualMachinesInstanceActionsProps = {
  actions: Action[];
  isKebabToggle?: boolean;
};

const VirtualMachineActions: FC<VirtualMachinesInstanceActionsProps> = ({
  actions,
  isKebabToggle,
}) => (
  <ActionsDropdown
    actions={actions}
    className="VirtualMachineActions"
    id="virtual-machine-actions"
    isKebabToggle={isKebabToggle}
  />
);

export default memo(VirtualMachineActions);
