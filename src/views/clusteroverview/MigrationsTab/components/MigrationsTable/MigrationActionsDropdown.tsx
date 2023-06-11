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
  isKebabToggle?: boolean;
  vmim: V1VirtualMachineInstanceMigration;
};

const MigrationActionsDropdown: React.FC<MigrationActionsDropdownProps> = ({
  isKebabToggle,
  vmim,
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
      dropdownItems={actions?.map((action) => (
        <DropdownItem
          data-test-id={action?.id}
          description={action?.description}
          isDisabled={action?.disabled}
          key={action?.id}
          onClick={() => handleClick(action)}
        >
          {action?.label}
        </DropdownItem>
      ))}
      toggle={
        isKebabToggle ? (
          <KebabToggle onToggle={setIsOpen} />
        ) : (
          <DropdownToggle onToggle={setIsOpen}>{t('Actions')}</DropdownToggle>
        )
      }
      data-test-id="virtual-machine-instance-migration-actions"
      isOpen={isOpen}
      isPlain={isKebabToggle}
      position={DropdownPosition.right}
    />
  );
};

export default MigrationActionsDropdown;
