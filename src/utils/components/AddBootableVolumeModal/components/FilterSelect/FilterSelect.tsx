import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectVariant } from '@patternfly/react-core';

import FilterSelectOption from './components/FilterSelectOption/FilterSelectOption';

type FilterSelectProps = {
  groupVersionKind: K8sGroupVersionKind;
  optionLabelText?: string;
  options: string[];
  selected: string;
  setSelected: (val: string) => void;
};

const FilterSelect: FC<FilterSelectProps> = ({
  groupVersionKind,
  optionLabelText = 'option',
  options,
  selected,
  setSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Select
      onFilter={(_, value: string) => {
        if (!value) {
          return options.map((option) => (
            <FilterSelectOption
              groupVersionKind={groupVersionKind}
              key={option}
              optionLabel={optionLabelText}
              optionName={option}
            />
          ));
        }
        const regex = new RegExp(value, 'i');
        const newOptions = options.filter((name) => regex.test(name));

        return newOptions.map((option) => (
          <FilterSelectOption
            groupVersionKind={groupVersionKind}
            key={option}
            optionLabel={optionLabelText}
            optionName={option}
          />
        ));
      }}
      onSelect={(_, value: string) => {
        setSelected(value);
        setIsOpen(false);
      }}
      hasInlineFilter
      isOpen={isOpen}
      maxHeight={200}
      menuAppendTo="parent"
      onToggle={setIsOpen}
      placeholderText={t('Select {{optionLabelText}}', { optionLabelText })}
      selections={selected}
      variant={SelectVariant.single}
    >
      {options.map((option) => (
        <FilterSelectOption
          groupVersionKind={groupVersionKind}
          key={option}
          optionLabel={optionLabelText}
          optionName={option}
        />
      ))}
    </Select>
  );
};

export default FilterSelect;
