import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useVirtualMachineTemplatesActions from './hooks/useVirtualMachineTemplatesActions';
import { EDIT_TEMPLATE_ID } from './constants';

type VirtualMachineTemplatesActionsProps = { isKebabToggle?: boolean; template: V1Template };

const VirtualMachineTemplatesActions: FC<VirtualMachineTemplatesActionsProps> = ({
  isKebabToggle,
  template,
}) => {
  const [actions, onLazyActions] = useVirtualMachineTemplatesActions(template);

  const filteredActions = actions.filter((action) => action.id !== EDIT_TEMPLATE_ID);

  return (
    <ActionsDropdown
      actions={isKebabToggle ? actions : filteredActions}
      isKebabToggle={isKebabToggle}
      onLazyClick={onLazyActions}
    />
  );
};

export default VirtualMachineTemplatesActions;
