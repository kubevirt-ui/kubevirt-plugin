import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';

import { InitialMigrationPolicyState } from '../../../../list/components/MigrationPolicyCreateForm/utils/utils';
import {
  EditMigrationPolicyInitialState,
  MigrationPolicyStateDispatch,
} from '../../../MigrationPolicyEditModal/utils/constants';
import { MigrationPolicyConfigurationOption } from '../../utils/constants';

type MigrationPolicyConfigurationDropdownProps = {
  isDisabled: boolean;
  options: MigrationPolicyConfigurationOption;
  setState: React.Dispatch<
    React.SetStateAction<EditMigrationPolicyInitialState | InitialMigrationPolicyState>
  >;
  state: EditMigrationPolicyInitialState | InitialMigrationPolicyState;
};

const MigrationPolicyConfigurationDropdown: React.FC<MigrationPolicyConfigurationDropdownProps> = ({
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
  return (
    <Dropdown
      dropdownItems={Object.entries(options).map(([key, { defaultValue, description, label }]) => (
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
      toggle={
        <DropdownToggle isDisabled={isDisabled} onToggle={setIsOpen}>
          {t('Add configuration')}
        </DropdownToggle>
      }
      className="migration-policy__form-config-dropdown"
      data-test-id="migration-policies-configurations"
      isOpen={isOpen}
      menuAppendTo="parent"
    />
  );
};

export default MigrationPolicyConfigurationDropdown;
