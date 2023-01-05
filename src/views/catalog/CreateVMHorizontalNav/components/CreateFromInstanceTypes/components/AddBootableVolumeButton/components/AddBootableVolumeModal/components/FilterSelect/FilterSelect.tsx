import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Select, SelectVariant } from '@patternfly/react-core';

import FilterSelectOption from './components/FilterSelectOption/FilterSelectOption';

type FilterSelectProps = {
  selected: string;
  setSelected: (val: string) => void;
  options: string[];
  optionLabelText?: string;
};

const FilterSelect: FC<FilterSelectProps> = ({
  selected,
  setSelected,
  options,
  optionLabelText = 'option',
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Select
      menuAppendTo="parent"
      isOpen={isOpen}
      onToggle={setIsOpen}
      onSelect={(_, value: string) => {
        setSelected(value);
        setIsOpen(false);
      }}
      variant={SelectVariant.single}
      selections={selected}
      maxHeight={200}
      placeholderText={t('Select {{optionLabelText}}', { optionLabelText })}
      hasInlineFilter
      onFilter={(_, value: string) => {
        if (!value) {
          return options.map((option) => (
            <FilterSelectOption key={option} optionLabel={optionLabelText} optionName={option} />
          ));
        }
        const regex = new RegExp(value, 'i');
        const newOptions = options.filter((name) => regex.test(name));

        return newOptions.map((option) => (
          <FilterSelectOption key={option} optionLabel={optionLabelText} optionName={option} />
        ));
      }}
    >
      {options.map((option) => (
        <FilterSelectOption key={option} optionLabel={optionLabelText} optionName={option} />
      ))}
    </Select>
  );
};

export default FilterSelect;
