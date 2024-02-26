import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { InitialMigrationPolicyState } from '../../../../list/components/MigrationPolicyCreateForm/utils/utils';
import {
  EditMigrationPolicyInitialState,
  MigrationPolicyStateDispatch,
} from '../../../MigrationPolicyEditModal/utils/constants';
import { MigrationPolicyConfigurationOption } from '../../utils/constants';

type MigrationPolicyConfigurationDropdownProps = {
  isDisabled: boolean;
  options: MigrationPolicyConfigurationOption;
  setState: Dispatch<SetStateAction<EditMigrationPolicyInitialState | InitialMigrationPolicyState>>;
  state: EditMigrationPolicyInitialState | InitialMigrationPolicyState;
};

const MigrationPolicyConfigurationDropdown: FC<MigrationPolicyConfigurationDropdownProps> = ({
  isDisabled,
  options,
  setState,
  state,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (key: string, defaultValue: MigrationPolicyStateDispatch) => {
    setState((prev) => ({ ...prev, [key]: defaultValue }));
    setIsOpen(false);
  };

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);
  return (
    <Dropdown
      toggle={DropdownToggle({
        children: t('Add configuration'),
        isDisabled,
        isExpanded: isOpen,
        onClick: onToggle,
      })}
      className="migration-policy__form-config-dropdown"
      data-test-id="migration-policies-configurations"
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
    >
      <DropdownList>
        {Object.entries(options).map(([key, { defaultValue, description, label }]) => (
          <DropdownItem
            data-test-id={key}
            description={description}
            isDisabled={key in state}
            key={key}
            onClick={() => handleOptionClick(key, defaultValue)}
          >
            {label}
          </DropdownItem>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export default MigrationPolicyConfigurationDropdown;
