import React, { FC } from 'react';

import CheckboxSelect from '@kubevirt-utils/components/CheckboxSelect/CheckboxSelect';
import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { getOnSelect } from '../utils';

import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type SelectFilterItemProps = {
  filterDef: KubevirtFilter;
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
  toggleTitle?: string;
};

const SelectFilterItem: FC<SelectFilterItemProps> = ({
  filterDef,
  filters,
  onSetFilters,
  toggleTitle,
}) => {
  const selected = filters[filterDef.id] ?? [];
  const onSelect = getOnSelect(filters, onSetFilters);

  return (
    <ToolbarFilterMultiChip filterDef={filterDef} filters={filters} onSetFilters={onSetFilters}>
      <CheckboxSelect
        options={filterDef.options?.map(({ label, value }) => ({
          children: label,
          isSelected: selected.includes(value),
          value,
        }))}
        badgeNumber={filterDef.toggleBadgeNumber}
        isToggleDisabled={filterDef.disabled}
        onSelect={(_event, value: string) => onSelect(filterDef.id, value)}
        selectedValues={selected}
        showAllBadge={filterDef.showAllBadge}
        toggleTitle={toggleTitle ?? filterDef.categoryLabel}
        tooltipContent={filterDef.disabledTooltip}
      />
    </ToolbarFilterMultiChip>
  );
};

export default SelectFilterItem;
