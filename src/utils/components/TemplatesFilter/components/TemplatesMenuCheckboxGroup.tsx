import React, { FC } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { SelectGroup, SelectOption } from '@patternfly/react-core';

import { type UniversalFilter } from '../../../hooks/useUniversalFilter/useUniversalFilter';

type TemplatesMenuCheckboxGroupProps = {
  className?: string;
  filterDefinition: KubevirtFilter<TemplateOrRequest>;
  universalFilter: UniversalFilter;
};

const TemplatesMenuCheckboxGroup: FC<TemplatesMenuCheckboxGroupProps> = ({
  className,
  filterDefinition,
  universalFilter: { isSelected, onSelect },
}) => (
  <SelectGroup className={className} label={filterDefinition.categoryLabel}>
    {filterDefinition.options?.map(({ label, value }) => (
      <SelectOption
        data-test-row-filter={value}
        hasCheckbox
        isSelected={isSelected(filterDefinition.id, value)}
        key={value}
        onClick={() => onSelect(filterDefinition.id, value)}
        value={value}
      >
        {label}
      </SelectOption>
    ))}
  </SelectGroup>
);

export default TemplatesMenuCheckboxGroup;
