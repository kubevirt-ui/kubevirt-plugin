import React, { FC, ReactNode, useMemo, useState } from 'react';

import {
  FilterableObject,
  KubevirtFilter,
  KubevirtFilterLayout,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { Toolbar, ToolbarContent, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import ListPageFilterToolbarActions from '../ListPageFilter/components/ListPageFilterToolbarActions';

import { EMPTY_FILTERS } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/constants';
import GroupedFilterDropdown from './components/GroupedFilterDropdown';
import HiddenFilterChips from './components/HiddenFilterChips';
import SelectFilterItem from './components/SelectFilterItem';
import TextSearchFilters from './components/TextSearchFilters';

type KubevirtFilterToolbarProps = {
  clearAllFilters: () => void;
  columnLayout?: ColumnLayout;
  /** Replaces the default checkbox content inside the Filter dropdown */
  customFilterMenu?: ReactNode;
  data?: FilterableObject[];
  filterDefinitions?: KubevirtFilter[];
  filters: KubevirtFilterState;
  hideColumnManagement?: boolean;
  hideLabelFilter?: boolean;
  loaded?: boolean;
  onSetFilters: OnSetFilters;
  toolbarEndContent?: ReactNode;
  toolbarStartContent?: ReactNode;
};

const KubevirtFilterToolbar: FC<KubevirtFilterToolbarProps> = ({
  clearAllFilters,
  columnLayout,
  customFilterMenu,
  data,
  filterDefinitions = EMPTY_FILTERS,
  filters,
  hideColumnManagement,
  hideLabelFilter,
  loaded,
  onSetFilters,
  toolbarEndContent,
  toolbarStartContent,
}) => {
  const { t } = useKubevirtTranslation();

  const groupedFilters = useMemo(
    () =>
      filterDefinitions.filter(
        (f) =>
          f.filterLayout !== KubevirtFilterLayout.HIDDEN &&
          f.filterLayout !== KubevirtFilterLayout.SELECT,
      ),
    [filterDefinitions],
  );
  const selectFilters = useMemo(
    () => filterDefinitions.filter((f) => f.filterLayout === KubevirtFilterLayout.SELECT),
    [filterDefinitions],
  );
  const hiddenFilters = useMemo(
    () => filterDefinitions.filter((f) => f.filterLayout === KubevirtFilterLayout.HIDDEN),
    [filterDefinitions],
  );
  const [searchInputText, setSearchInputText] = useState(filters.name[0] ?? '');

  if (!loaded) return null;

  return (
    <Toolbar
      clearAllFilters={() => {
        clearAllFilters();
        setSearchInputText('');
      }}
      clearFiltersButtonText={t('Clear all filters')}
      data-test="filter-toolbar"
      id="filter-toolbar"
    >
      <ToolbarContent>
        {toolbarStartContent}
        <ToolbarToggleGroup breakpoint="md" toggleIcon={<FilterIcon />}>
          {(customFilterMenu || !isEmpty(groupedFilters)) && (
            <GroupedFilterDropdown
              customMenu={customFilterMenu}
              data={data}
              filters={filters}
              groupedFilters={groupedFilters}
              onSetFilters={onSetFilters}
            />
          )}
          {selectFilters.map((filterDef) => (
            <SelectFilterItem
              filterDef={filterDef}
              filters={filters}
              key={filterDef.id}
              onSetFilters={onSetFilters}
            />
          ))}
          <TextSearchFilters
            data={data}
            filters={filters}
            hideLabelFilter={hideLabelFilter}
            onSetFilters={onSetFilters}
            searchInputText={searchInputText}
            setSearchInputText={setSearchInputText}
          />
          <HiddenFilterChips
            filters={filters}
            hiddenFilters={hiddenFilters}
            onSetFilters={onSetFilters}
          />
        </ToolbarToggleGroup>
        <ListPageFilterToolbarActions
          columnLayout={columnLayout}
          hideColumnManagement={hideColumnManagement}
          toolbarEndContent={toolbarEndContent}
        />
      </ToolbarContent>
    </Toolbar>
  );
};

export default KubevirtFilterToolbar;
