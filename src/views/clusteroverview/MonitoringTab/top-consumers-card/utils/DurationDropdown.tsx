import * as React from 'react';

import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import DurationOption from './DurationOption';

export type DurationDropdownProps = {
  selectedDuration: string;
  selectHandler: (value: string) => void;
};

const DurationDropdown: React.FC<DurationDropdownProps> = ({ selectedDuration, selectHandler }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onSelect = (event, durationOption: string) => {
    selectHandler(durationOption);
    setIsOpen(false);
  };

  return (
    <Select
      data-test-id="duration-select-dropdown"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      onSelect={onSelect}
      selections={DurationOption.fromString(selectedDuration)?.getDropdownLabel()}
      variant={SelectVariant.single}
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
