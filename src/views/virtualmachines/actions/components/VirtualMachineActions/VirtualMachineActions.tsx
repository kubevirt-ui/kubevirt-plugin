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
  isKebabToggle?: boolean;
  isSingleNodeCluster: boolean;
  vm: V1VirtualMachine;
  vmim: V1VirtualMachineInstanceMigration;
};

const VirtualMachineActions: React.FC<VirtualMachinesInstanceActionsProps> = ({
  isKebabToggle,
  isSingleNodeCluster,
  vm,
  vmim,
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
      dropdownItems={actions?.map((action) => (
        <ActionDropdownItem action={action} key={action?.id} setIsOpen={setIsOpen} />
      ))}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={setIsOpen} />
        ) : (
          <DropdownToggle onToggle={setIsOpen}>{t('Actions')}</DropdownToggle>
        )
      }
      data-test-id="virtual-machine-actions"
      isOpen={isOpen}
      isPlain={isKebabToggle}
      menuAppendTo={getContentScrollableElement}
      position={DropdownPosition.right}
    />
  );
};

export default VirtualMachineActions;
