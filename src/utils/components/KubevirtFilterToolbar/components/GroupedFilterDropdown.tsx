import React, { type FC, type ReactNode } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import {
  type FilterableObject,
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge, Icon, SelectGroup, SelectOption, ToolbarItem } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { type GroupedFilterOptionValue } from '../types';
import { getOnSelect } from '../utils';

import useItemCounts from '../hooks/useItemCounts';
import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type GroupedFilterDropdownProps = {
  /** Replaces the default content inside the dropdown */
  customMenu?: ReactNode;
  data?: FilterableObject[];
  filters: KubevirtFilterState;
  groupedFilters: KubevirtFilter[];
  onSetFilters: OnSetFilters;
};

const GroupedFilterDropdown: FC<GroupedFilterDropdownProps> = ({
  customMenu,
  data,
  filters,
  groupedFilters,
  onSetFilters,
}) => {
  const { t } = useKubevirtTranslation();
  const onSelect = getOnSelect(filters, onSetFilters);

  const itemCounts = useItemCounts(groupedFilters, data);

  const onGroupedFilterSelect = (
    _event: unknown,
    selectedOption: GroupedFilterOptionValue,
  ): void => {
    const { filterId, value } = selectedOption;
    const filterExists = groupedFilters.some((filter) => filter.id === filterId);
    if (!filterExists) return;

    onSelect(filterId, value);
  };

  return (
    <>
      <ToolbarItem data-test="filter-dropdown-toggle">
        <FormPFSelect
          closeOnSelect={false}
          onSelect={customMenu ? undefined : onGroupedFilterSelect}
          selectedLabel={t('Filter')}
          toggleProps={{
            icon: (
              <Icon className="span--icon__right-margin">
                <FilterIcon />
              </Icon>
            ),
          }}
        >
          {customMenu ??
            groupedFilters.map((filterDef) => (
              <SelectGroup key={filterDef.id} label={filterDef.categoryLabel}>
                {filterDef.options?.map(({ label, value }) => (
                  <SelectOption
                    data-test-row-filter={value}
                    hasCheckbox
                    isSelected={filters[filterDef.id]?.includes(value)}
                    key={value}
                    value={{ filterId: filterDef.id, value } as GroupedFilterOptionValue}
                  >
                    <span className="co-filter-dropdown-item__name">{label}</span>
                    {!filterDef.hideCountBadge && (
                      <Badge isRead key={value}>
                        {itemCounts[filterDef.id]?.[value] ?? 0}
                      </Badge>
                    )}
                  </SelectOption>
                ))}
              </SelectGroup>
            ))}
        </FormPFSelect>
      </ToolbarItem>

      {groupedFilters.map((filterDef) => (
        <ToolbarFilterMultiChip
          filterDef={filterDef}
          filters={filters}
          key={filterDef.id}
          onSetFilters={onSetFilters}
        />
      ))}
    </>
  );
};

export default GroupedFilterDropdown;
