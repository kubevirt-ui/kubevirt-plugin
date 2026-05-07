import React, { FC } from 'react';

import { ExtendedRowFilterItem } from '@kubevirt-utils/components/ListPageFilter/types';
import { UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Stack, StackItem } from '@patternfly/react-core';

type TemplatesSidebarCheckboxGroupProps = {
  className?: string;
  rowFilter: RowFilter;
  universalFilter: UniversalFilter;
};

const TemplatesSidebarCheckboxGroup: FC<TemplatesSidebarCheckboxGroupProps> = ({
  className,
  rowFilter,
  universalFilter: { isSelected, onSelect },
}) => (
  <Stack className={className} hasGutter>
    <h5 className="pf-v6-u-text-color-subtle">{rowFilter.filterGroupName}</h5>
    {rowFilter.items.map((item: ExtendedRowFilterItem) => (
      <StackItem key={item.id}>
        <Checkbox
          id={`filter-${rowFilter.type}-${item.id}`}
          isChecked={isSelected(rowFilter.type, item.id)}
          label={item.content ?? item.title}
          onChange={() => onSelect(rowFilter.type, item.id)}
        />
      </StackItem>
    ))}
  </Stack>
);

export default TemplatesSidebarCheckboxGroup;
