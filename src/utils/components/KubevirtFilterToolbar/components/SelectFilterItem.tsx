import React, { FC } from 'react';

import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import {
  KubevirtFilter,
  KubevirtFilterState,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import useOnSelect from '../hooks/useOnSelect';

import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type SelectFilterItemProps = {
  filterDef: KubevirtFilter;
  filters: KubevirtFilterState;
  onSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
};

const SelectFilterItem: FC<SelectFilterItemProps> = ({ filterDef, filters, onSetFilters }) => {
  const selected = filters[filterDef.id] ?? [];
  const onSelect = useOnSelect({ filters, onSetFilters });

  return (
    <ToolbarFilterMultiChip filterDef={filterDef} filters={filters} onSetFilters={onSetFilters}>
      <CheckboxSelect
        options={filterDef.options.map(({ label, value }) => ({
          children: label,
          isSelected: selected.includes(value),
          value,
        }))}
        onSelect={(_event, value: string) => onSelect(filterDef.id, value)}
        selectedValues={selected}
        toggleTitle={filterDef.categoryLabel}
      />
    </ToolbarFilterMultiChip>
  );
};

export default SelectFilterItem;
