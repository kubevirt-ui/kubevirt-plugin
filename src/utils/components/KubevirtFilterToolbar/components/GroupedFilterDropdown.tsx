/* eslint-disable */
import React, { FC, ReactNode } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import {
  FilterableObject,
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge, Icon, SelectGroup, SelectOption, ToolbarItem } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import useItemCounts from '../hooks/useItemCounts';
import { GroupedFilterOptionValue } from '../types';
import { getOnSelect } from '../utils';

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

  const onGroupedFilterSelect = (_event: unknown, selectedOption: GroupedFilterOptionValue) => {
    const { filterId, value } = selectedOption;
    const filterDef = groupedFilters.find((f) => f.id === filterId);
    if (!filterDef) return;

    onSelect(filterId, value);
  };

  return (
    <>
      <ToolbarItem data-test="filter-dropdown-toggle">
        <FormPFSelect
          toggleProps={{
            icon: (
              <Icon className="span--icon__right-margin">
                <FilterIcon />
              </Icon>
            ),
          }}
          closeOnSelect={false}
          onSelect={customMenu ? undefined : onGroupedFilterSelect}
          selectedLabel={t('Filter')}
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
