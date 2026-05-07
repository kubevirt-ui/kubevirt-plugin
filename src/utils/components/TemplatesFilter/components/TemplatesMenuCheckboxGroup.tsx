import React, { FC } from 'react';

import { ExtendedRowFilterItem } from '@kubevirt-utils/components/ListPageFilter/types';
import { UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { SelectGroup, SelectOption } from '@patternfly/react-core';

type TemplatesMenuCheckboxGroupProps = {
  className?: string;
  rowFilter: RowFilter;
  universalFilter: UniversalFilter;
};

const TemplatesMenuCheckboxGroup: FC<TemplatesMenuCheckboxGroupProps> = ({
  className,
  rowFilter,
  universalFilter: { isSelected, onSelect },
}) => (
  <SelectGroup className={className} label={rowFilter.filterGroupName}>
    {rowFilter.items.map((item: ExtendedRowFilterItem) => (
      <SelectOption
        hasCheckbox
        isSelected={isSelected(rowFilter.type, item.id)}
        key={item.id}
        onClick={() => onSelect(rowFilter.type, item.id)}
        value={item.id}
      >
        {item.content ?? item.title}
      </SelectOption>
    ))}
  </SelectGroup>
);

export default TemplatesMenuCheckboxGroup;
