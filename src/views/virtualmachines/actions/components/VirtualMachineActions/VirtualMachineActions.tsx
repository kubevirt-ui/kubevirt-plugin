import React, { FC, memo } from 'react';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

import './VirtualMachineActions.scss';

type VirtualMachinesInstanceActionsProps = {
  actions: ActionDropdownItemType[];
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
