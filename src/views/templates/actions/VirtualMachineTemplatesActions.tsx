import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

import useVirtualMachineTemplatesActions from './hooks/useVirtualMachineTemplatesActions';

type VirtualMachineTemplatesActionsProps = { template: V1Template };

const VirtualMachineTemplatesActions: React.FC<VirtualMachineTemplatesActionsProps> = ({
  template,
}) => {
  const [actions, onLazyActions] = useVirtualMachineTemplatesActions(template);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  const onDropDownToggle = (value: boolean) => {
    setIsOpen(value);
    if (value) onLazyActions();
  };

  return (
    // TODO: use LazyActionMenu when fixed
    <Dropdown
      dropdownItems={actions?.map((action) => (
        <DropdownItem
          description={action?.disabled && action?.description}
          isDisabled={action?.disabled}
          key={action?.id}
          onClick={() => handleClick(action)}
        >
          {action?.label}
        </DropdownItem>
      ))}
      isOpen={isOpen}
      isPlain
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
      toggle={<KebabToggle onToggle={onDropDownToggle} />}
    />
  );
};

export default VirtualMachineTemplatesActions;
