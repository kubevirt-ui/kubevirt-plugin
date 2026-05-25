import React, { FC } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import {
  KubevirtFilter,
  KubevirtFilterState,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Badge, Icon, SelectGroup, SelectOption, ToolbarItem } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import useItemCounts from '../hooks/useItemCounts';
import useOnSelect from '../hooks/useOnSelect';

import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type GroupedFilterOptionValue = {
  filterId: string;
  value: string;
};

type GroupedFilterDropdownProps = {
  data?: K8sResourceCommon[];
  filters: KubevirtFilterState;
  groupedFilters: KubevirtFilter[];
  onSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
};

const GroupedFilterDropdown: FC<GroupedFilterDropdownProps> = ({
  data,
  filters,
  groupedFilters,
  onSetFilters,
}) => {
  const { t } = useKubevirtTranslation();
  const onSelect = useOnSelect({ filters, onSetFilters });

  const itemCounts = useItemCounts(groupedFilters, data);

  const onGroupedFilterSelect = (_event: unknown, selectedOption: GroupedFilterOptionValue) => {
    const { filterId, value } = selectedOption;
    const filterDef = groupedFilters.find((f) => f.id === filterId);
    if (!filterDef) return;

    onSelect(filterId, value);
  };

  return (
    <>
      <ToolbarItem data-test-id="filter-dropdown-toggle">
        <FormPFSelect
          toggleProps={{
            icon: (
              <Icon className="span--icon__right-margin">
                <FilterIcon />
              </Icon>
            ),
          }}
          closeOnSelect={false}
          onSelect={onGroupedFilterSelect}
          selectedLabel={t('Filter')}
        >
          {groupedFilters.map((filterDef) => (
            <SelectGroup key={filterDef.id} label={filterDef.categoryLabel}>
              {filterDef.options.map(({ label, value }) => (
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
