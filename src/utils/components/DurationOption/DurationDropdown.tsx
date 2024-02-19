import React, { FC, useState } from 'react';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { Select, SelectOption } from '@patternfly/react-core';

import SelectToggle from '../toggles/SelectToggle';

export type DurationDropdownProps = {
  selectedDuration: string;
  selectHandler: (value: string) => void;
};

const DurationDropdown: FC<DurationDropdownProps> = ({ selectedDuration, selectHandler }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_, durationOption: string) => {
    selectHandler(durationOption);
    setIsOpen(false);
  };

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const selected = DurationOption.fromString(selectedDuration)?.getDropdownLabel();
  return (
    <Select
      data-test-id="duration-select-dropdown"
      isOpen={isOpen}
      onSelect={onSelect}
      selected={selected}
      toggle={SelectToggle({ isExpanded: isOpen, onClick: onToggle, selected })}
    >
      {DurationOption.getAll().map((durationOption) => {
        const dropdownLabel = durationOption?.getDropdownLabel() || '';
        const durationValue = durationOption?.getValue() || '';

        return (
          <SelectOption data-test-id={durationValue} key={durationValue} value={dropdownLabel}>
            {dropdownLabel}
          </SelectOption>
        );
      })}
    </Select>
  );
};

export default DurationDropdown;
