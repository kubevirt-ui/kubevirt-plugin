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
  setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  options: MigrationPolicyConfigurationOption;
};

const MigrationPolicyConfigurationDropdown: React.FC<MigrationPolicyConfigurationDropdownProps> = ({
  state,
  setState,
  setShowDropdown,
  options,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (key: string, defaultValue: MigrationPolicyStateDispatch) => {
    setState((prev) => ({ ...prev, [key]: defaultValue }));
    setIsOpen(false);
    setShowDropdown(false);
  };
  return (
    <Dropdown
      menuAppendTo="parent"
      className="migration-policy__form-config-dropdown"
      data-test-id="migration-policies-configurations"
      isOpen={isOpen}
      toggle={<DropdownToggle onToggle={setIsOpen}>{t('Select field')}</DropdownToggle>}
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
