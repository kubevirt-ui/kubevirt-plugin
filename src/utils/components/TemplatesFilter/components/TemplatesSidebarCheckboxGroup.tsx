import React, { type FC } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';

import { type UniversalFilter } from '../../../hooks/useUniversalFilter/useUniversalFilter';

type TemplatesSidebarCheckboxGroupProps = {
  className?: string;
  filterDefinition: KubevirtFilter<TemplateOrRequest>;
  universalFilter: UniversalFilter;
};

const TemplatesSidebarCheckboxGroup: FC<TemplatesSidebarCheckboxGroupProps> = ({
  className,
  filterDefinition,
  universalFilter: { isSelected, onSelect },
}) => (
  <Stack
    className={className}
    data-test={`filter-category-${filterDefinition.categoryLabel}`}
    hasGutter
  >
    <h5 className="pf-v6-u-text-color-subtle">{filterDefinition.categoryLabel}</h5>
    {filterDefinition.options?.map(({ label, value }) => (
      <StackItem data-test={`${filterDefinition.id}-${value}`} key={value}>
        <Checkbox
          id={`filter-${filterDefinition.id}-${value}`}
          isChecked={isSelected(filterDefinition.id, value)}
          label={label}
          onChange={() => onSelect(filterDefinition.id, value)}
        />
      </StackItem>
    ))}
  </Stack>
);

export default TemplatesSidebarCheckboxGroup;
