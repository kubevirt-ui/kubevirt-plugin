import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import {
  Badge,
  Icon,
  SelectGroup,
  SelectOption,
  ToolbarChip,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import FormPFSelect from '../FormPFSelect/FormPFSelect';

import { Filter, FilterKeys, generateRowFilters, intersection } from './utils';

type RowFiltersProps = {
  filters: Filter;
  filtersNameMap: FilterKeys;
  generatedRowFilters: ReturnType<typeof generateRowFilters>;
  rowFilters: RowFilter[];
  selectedRowFilters: string[];
  updateRowFilterSelected: (id: string[]) => void;
};

const RowFilters: FC<RowFiltersProps> = ({
  filters,
  filtersNameMap,
  generatedRowFilters,
  rowFilters,
  selectedRowFilters,
  updateRowFilterSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const clearAllRowFilter = (f: string) => {
    updateRowFilterSelected(intersection(filters[f], selectedRowFilters));
  };

  const onRowFilterSelect = (_, filterID: string) => {
    updateRowFilterSelected([filterID]);
  };

  if (isEmpty(rowFilters)) return null;

  return (
    <ToolbarItem>
      {Object.keys(filters).reduce(
        (acc, key) => (
          <ToolbarFilter
            chipGroupCollapsedText={t('{{numRemaining}} more', {
              numRemaining: '${remaining}',
            })}
            chips={intersection(selectedRowFilters, filters[key]).map((item) => {
              return {
                key: item,
                node: filtersNameMap[item],
              };
            })}
            categoryName={key}
            chipGroupExpandedText={t('Show less')}
            deleteChip={(filter, chip: ToolbarChip) => updateRowFilterSelected([chip.key])}
            deleteChipGroup={() => clearAllRowFilter(key)}
            key={key}
          >
            {acc}
          </ToolbarFilter>
        ),
        <div data-test-id="filter-dropdown-toggle">
          <FormPFSelect
            toggleProps={{
              icon: (
                <Icon className="span--icon__right-margin">
                  <FilterIcon />
                </Icon>
              ),
            }}
            closeOnSelect={false}
            onSelect={onRowFilterSelect}
            selected={selectedRowFilters}
            selectedLabel={t('Filter')}
          >
            {generatedRowFilters.map((rowFilter) => (
              <SelectGroup key={rowFilter.filterGroupName} label={rowFilter.filterGroupName}>
                {rowFilter.items?.map?.((item) =>
                  item.hideIfEmpty && (item.count === 0 || item.count === '0') ? (
                    <></>
                  ) : (
                    <SelectOption
                      data-test-row-filter={item.id}
                      hasCheckbox
                      isSelected={selectedRowFilters?.includes(item.id)}
                      key={item.id}
                      value={item.id}
                    >
                      <span className="co-filter-dropdown-item__name">{item.title}</span>
                      <Badge isRead key={item.id}>
                        {item.count}
                      </Badge>
                    </SelectOption>
                  ),
                )}
              </SelectGroup>
            ))}
          </FormPFSelect>
        </div>,
      )}
    </ToolbarItem>
  );
};

export default RowFilters;
