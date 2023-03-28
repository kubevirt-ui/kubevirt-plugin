import React, { useState } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getContentScrollableElement } from '@kubevirt-utils/utils/utils';
// import { LazyActionMenu } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Dropdown, DropdownPosition, DropdownToggle, KebabToggle } from '@patternfly/react-core';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';

type VirtualMachinesInstanceActionsProps = {
  vm: V1VirtualMachine;
  isKebabToggle?: boolean;
  vmim: V1VirtualMachineInstanceMigration;
  isSingleNodeCluster: boolean;
};

const VirtualMachineActions: React.FC<VirtualMachinesInstanceActionsProps> = ({
  vm,
  vmim,
  isKebabToggle,
  isSingleNodeCluster,
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
  const [isOpen, setIsOpen] = useState(false);
  const [actions] = useVirtualMachineActionsProvider(vm, vmim, isSingleNodeCluster);

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
        <ActionDropdownItem key={action?.id} action={action} setIsOpen={setIsOpen} />
      ))}
    />
  );
};

export default VirtualMachineActions;
