import React, { FC, useEffect, useState } from 'react';

import AdvancedFiltersToolbarItem from '@kubevirt-utils/components/ListPageFilter/components/AdvancedFiltersToolbarItem';
import CheckboxSelectFilter from '@kubevirt-utils/components/ListPageFilter/components/CheckboxSelectFilter';
import { useApplyFiltersWithQuery } from '@kubevirt-utils/components/ListPageFilter/hooks/useApplyFiltersWithQuery';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OnFilterChange, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { ListPageBodySize } from '@virtualmachines/list/listPageBodySize';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

type VirtualMachineFilterToolbarProps = {
  className?: string;
  filtersWithSelect?: RowFilter[];
  hiddenFilters?: RowFilter[];
  isSearchResultsPage?: boolean;
  listPageBodySize?: ListPageBodySize;
  loaded?: boolean;
  onFilterChange?: OnFilterChange;
};

const VirtualMachineFilterToolbar: FC<VirtualMachineFilterToolbarProps> = ({
  className,
  filtersWithSelect = [],
  hiddenFilters = [],
  isSearchResultsPage,
  listPageBodySize,
  loaded,
  onFilterChange,
}) => {
  const { t } = useKubevirtTranslation();

  const [toolbarIsExpanded, setToolbarIsExpanded] = useState(false);

  useEffect(() => {
    if (listPageBodySize !== ListPageBodySize.sm) {
      setToolbarIsExpanded(false);
    }
  }, [listPageBodySize]);

  const applyFilters: OnFilterChange = (type, input) => onFilterChange?.(type, input);
  const applyFiltersWithQuery = useApplyFiltersWithQuery(applyFilters);

  const clearAll = () => {
    applyFiltersWithQuery(VirtualMachineRowFilterType.Name);
    applyFiltersWithQuery(VirtualMachineRowFilterType.Labels);

    [...filtersWithSelect, ...hiddenFilters].forEach(
      (filter) => filter && applyFiltersWithQuery(filter.type),
    );
  };

  if (!loaded) return null;

  const filterSettings = {
    [VirtualMachineRowFilterType.Cluster]: {
      showAllBadge: true,
    },
    [VirtualMachineRowFilterType.HWDevices]: {
      filterGroupNameShortcut: t('HW devices'),
    },
    [VirtualMachineRowFilterType.OS]: {
      filterGroupNameShortcut: t('OS'),
      showAllBadge: true,
    },
    [VirtualMachineRowFilterType.Project]: {
      showAllBadge: true,
    },
    [VirtualMachineRowFilterType.Status]: {
      showAllBadge: true,
    },
  };

  return (
    <Toolbar
      toggleIsExpanded={() => {
        setToolbarIsExpanded(!toolbarIsExpanded);
      }}
      className={className}
      clearAllFilters={clearAll}
      clearFiltersButtonText={t('Clear all filters')}
      data-test="filter-toolbar"
      id="filter-toolbar"
      isExpanded={toolbarIsExpanded}
    >
      <ToolbarContent>
        {filtersWithSelect.map((filter) => {
          if (
            !isSearchResultsPage &&
            filter.type !== VirtualMachineRowFilterType.Status &&
            filter.type !== VirtualMachineRowFilterType.OS
          ) {
            return null;
          }

          return (
            <CheckboxSelectFilter
              categoryName={
                listPageBodySize !== ListPageBodySize.lg && isSearchResultsPage
                  ? filterSettings[filter.type as VirtualMachineRowFilterType]
                      ?.filterGroupNameShortcut ?? filter.filterGroupName
                  : filter.filterGroupName
              }
              showAllBadge={
                filterSettings[filter.type as VirtualMachineRowFilterType]?.showAllBadge
              }
              allValues={filter.items}
              applyFilters={applyFiltersWithQuery}
              filterType={filter.type as VirtualMachineRowFilterType}
              key={filter.type}
            />
          );
        })}
        <AdvancedFiltersToolbarItem
          advancedFilters={hiddenFilters}
          applyFilters={applyFiltersWithQuery}
        />
      </ToolbarContent>
    </Toolbar>
  );
};

export default VirtualMachineFilterToolbar;
