import * as React from 'react';

// import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
// import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Dropdown, DropdownItem, DropdownPosition, KebabToggle } from '@patternfly/react-core';

import useVirtualMachineInstanceActionsProvider from './hooks/useVirtualMachineInstanceActionsProvider';

type VirtualMachinesInsanceActionsProps = { vmi: V1VirtualMachineInstance };

const VirtualMachinesInsanceActions: React.FC<VirtualMachinesInsanceActionsProps> = ({ vmi }) => {
  // TODO: use LazyActionMenu when fixed
  // return (
  //   <LazyActionMenu
  //     variant={ActionMenuVariant.KEBAB}
  //     key={vmi?.metadata?.name}
  //     context={{ [VirtualMachineInstanceModelRef]: vmi }}
  //   />
  // );

  const [isOpen, setIsOpen] = React.useState(false);
  const [actions] = useVirtualMachineInstanceActionsProvider(vmi);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <Dropdown
      isPlain
      isOpen={isOpen}
      position={DropdownPosition.right}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      dropdownItems={actions?.map((action) => (
        <DropdownItem key={action?.id} onClick={() => handleClick(action)}>
          {action?.label}
        </DropdownItem>
      ))}
    />
  );
};

export default VirtualMachinesInsanceActions;
