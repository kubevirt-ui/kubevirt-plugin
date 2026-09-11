import React, { type Dispatch, type FC, type SetStateAction, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { type InitialMigrationPolicyState } from '../../../../list/components/MigrationPolicyCreateForm/utils/utils';
import {
  type EditMigrationPolicyInitialState,
  type MigrationPolicyStateDispatch,
} from '../../../MigrationPolicyEditModal/utils/constants';
import { type MigrationPolicyConfigurationOption } from '../../utils/constants';

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

  const handleOptionClick = (key: string, defaultValue: MigrationPolicyStateDispatch): void => {
    setState((prev) => ({ ...prev, [key]: defaultValue }));
    setIsOpen(false);
  };

  const onToggle = (): void => setIsOpen((prevIsOpen) => !prevIsOpen);
  return (
    <Dropdown
      className="migration-policy__form-config-dropdown"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={DropdownToggle({
        children: t('Add configuration'),
        isDisabled,
        isExpanded: isOpen,
        onClick: onToggle,
      })}
    >
      <DropdownList>
        {Object.entries(options).map(([key, { defaultValue, description, label }]) => (
          <DropdownItem
            data-test={key}
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
