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
  state: InitialMigrationPolicyState | EditMigrationPolicyInitialState;
  setState: React.Dispatch<
    React.SetStateAction<InitialMigrationPolicyState | EditMigrationPolicyInitialState>
  >;
  options: MigrationPolicyConfigurationOption;
  isDisabled: boolean;
};

const MigrationPolicyConfigurationDropdown: React.FC<MigrationPolicyConfigurationDropdownProps> = ({
  state,
  setState,
  options,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (key: string, defaultValue: MigrationPolicyStateDispatch) => {
    setState((prev) => ({ ...prev, [key]: defaultValue }));
    setIsOpen(false);
  };
  return (
    <Dropdown
      menuAppendTo="parent"
      className="migration-policy__form-config-dropdown"
      data-test-id="migration-policies-configurations"
      isOpen={isOpen}
      toggle={
        <DropdownToggle isDisabled={isDisabled} onToggle={setIsOpen}>
          {t('Add configuration')}
        </DropdownToggle>
      }
      dropdownItems={Object.entries(options).map(([key, { label, description, defaultValue }]) => (
        <DropdownItem
          data-test-id={key}
          key={key}
          onClick={() => handleOptionClick(key, defaultValue)}
          isDisabled={key in state}
          description={description}
        >
          {label}
        </DropdownItem>
      ))}
    />
  );
};

export default MigrationPolicyConfigurationDropdown;
