import * as React from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';

import useVirtualMachineInstanceMigrationActionsProvider from './hooks/useVirtualMachineInstanceMigrationActionsProvider';

type MigrationActionsDropdownProps = {
  vmim: V1VirtualMachineInstanceMigration;
  isKebabToggle?: boolean;
};

const MigrationActionsDropdown: React.FC<MigrationActionsDropdownProps> = ({
  vmim,
  isKebabToggle,
}) => {
  const { t } = useKubevirtTranslation();

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [actions] = useVirtualMachineInstanceMigrationActionsProvider(vmim);

  const handleClick = (action: Action) => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <Dropdown
      data-test-id="virtual-machine-instance-migration-actions"
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
          data-test-id={action?.id}
          key={action?.id}
          onClick={() => handleClick(action)}
          isDisabled={action?.disabled}
          description={action?.description}
        >
          {action?.label}
        </DropdownItem>
      ))}
    />
  );
};

export default MigrationActionsDropdown;
