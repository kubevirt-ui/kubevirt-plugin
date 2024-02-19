import React, { FC } from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useVirtualMachineInstanceMigrationActionsProvider from './hooks/useVirtualMachineInstanceMigrationActionsProvider';

type MigrationActionsDropdownProps = {
  isKebabToggle?: boolean;
  vmim: V1VirtualMachineInstanceMigration;
};

const MigrationActionsDropdown: FC<MigrationActionsDropdownProps> = ({ isKebabToggle, vmim }) => {
  const [actions] = useVirtualMachineInstanceMigrationActionsProvider(vmim);

  return (
    <ActionsDropdown
      actions={actions}
      id="virtual-machine-instance-migration-actions"
      isKebabToggle={isKebabToggle}
    />
  );
};

export default MigrationActionsDropdown;
