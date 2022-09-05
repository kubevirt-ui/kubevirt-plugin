import * as React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
// import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';

type VirtualMachinesInsanceActionsProps = {
  vm: V1VirtualMachine;
  isKebabToggle?: boolean;
  vmim: V1VirtualMachineInstanceMigration;
};

const VirtualMachineActions: React.FC<VirtualMachinesInsanceActionsProps> = ({
  vm,
  vmim,
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
  const [actions] = useVirtualMachineActionsProvider(vm, vmim);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <Dropdown
      menuAppendTo={getContentScrollableElement}
      data-test-id="virtual-machine-actions"
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
          data-test-id={`${action.id}`}
          key={action?.id}
          onClick={() => handleClick(action)}
          isDisabled={action?.disabled}
          description={action?.description}
        >
          {action?.label}
          {action?.icon && (
            <>
              {' '}
              <span className="text-muted">{action.icon}</span>
            </>
          )}
        </DropdownItem>
      ))}
    />
  );
};

export default VirtualMachineActions;
