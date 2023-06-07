import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectVariant } from '@patternfly/react-core';

import FilterSelectOption from './components/FilterSelectOption/FilterSelectOption';

type FilterSelectProps = {
  selected: string;
  setSelected: (val: string) => void;
  options: string[];
  groupVersionKind: K8sGroupVersionKind;
  optionLabelText?: string;
};

const FilterSelect: FC<FilterSelectProps> = ({
  selected,
  setSelected,
  options,
  groupVersionKind,
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
            <FilterSelectOption
              key={option}
              optionLabel={optionLabelText}
              optionName={option}
              groupVersionKind={groupVersionKind}
            />
          ));
        }
        const regex = new RegExp(value, 'i');
        const newOptions = options.filter((name) => regex.test(name));

        return newOptions.map((option) => (
          <FilterSelectOption
            key={option}
            optionLabel={optionLabelText}
            optionName={option}
            groupVersionKind={groupVersionKind}
          />
        ));
      }}
    >
      {options.map((option) => (
        <FilterSelectOption
          key={option}
          optionLabel={optionLabelText}
          optionName={option}
          groupVersionKind={groupVersionKind}
        />
      ))}
    </Select>
  );
};

export default FilterSelect;
