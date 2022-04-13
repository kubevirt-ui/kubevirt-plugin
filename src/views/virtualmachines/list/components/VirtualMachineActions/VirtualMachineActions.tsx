import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
// import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';

import useVirtualMachineActionsProvider from '../../../actions/hooks/useVirtualMachineActionsProvider';

type VirtualMachinesInsanceActionsProps = { vm: V1VirtualMachine; isKebabToggle?: boolean };

const VirtualMachineActions: React.FC<VirtualMachinesInsanceActionsProps> = ({
  vm,
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();
  // TODO: use LazyActionMenu when fixed
  // return (
  //   <LazyActionMenu
  //     variant={variant}
  //     key={vm?.metadata?.name}
  //     context={{ [VirtualMachineModelRef]: vm }}
  //   />
  // );
  const [isOpen, setIsOpen] = React.useState(false);
  const [actions] = useVirtualMachineActionsProvider(vm);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <Dropdown
      isPlain={isKebabToggle}
      isOpen={isOpen}
      position={DropdownPosition.right}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={setIsOpen} />
        ) : (
          <DropdownToggle onToggle={setIsOpen}>{t('Actions')}</DropdownToggle>
        )
      }
      dropdownItems={actions?.map((action) => (
        <DropdownItem
          key={action?.id}
          onClick={() => handleClick(action)}
          isDisabled={action?.disabled}
        >
          {action?.label}
        </DropdownItem>
      ))}
    />
  );
};

export default VirtualMachineActions;
