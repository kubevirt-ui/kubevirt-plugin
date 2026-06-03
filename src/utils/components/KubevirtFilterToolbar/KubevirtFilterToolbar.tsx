import React, { FC, useMemo, useState } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterLayout,
  KubevirtFilterState,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ColumnLayout, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Toolbar, ToolbarContent, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import ColumnManagement from '../ColumnManagementModal/ColumnManagement';

import GroupedFilterDropdown from './components/GroupedFilterDropdown';
import SelectFilterItem from './components/SelectFilterItem';
import TextSearchFilters from './components/TextSearchFilters';

type KubevirtFilterToolbarProps = {
  clearAllFilters: () => void;
  columnLayout?: ColumnLayout;
  data?: K8sResourceCommon[];
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  hideColumnManagement?: boolean;
  loaded?: boolean;
  onSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
};

const KubevirtFilterToolbar: FC<KubevirtFilterToolbarProps> = ({
  clearAllFilters,
  columnLayout,
  data,
  filterDefinitions,
  filters,
  hideColumnManagement,
  loaded,
  onSetFilters,
}) => {
  const { t } = useKubevirtTranslation();

  const groupedFilters = useMemo(
    () => filterDefinitions.filter((f) => f.filterLayout !== KubevirtFilterLayout.SELECT),
    [filterDefinitions],
  );
  const selectFilters = useMemo(
    () => filterDefinitions.filter((f) => f.filterLayout === KubevirtFilterLayout.SELECT),
    [filterDefinitions],
  );
  const [searchInputText, setSearchInputText] = useState('');

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
        <ToolbarToggleGroup breakpoint="md" toggleIcon={<FilterIcon />}>
          <GroupedFilterDropdown
            data={data}
            filters={filters}
            groupedFilters={groupedFilters}
            onSetFilters={onSetFilters}
          />
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
            onSetFilters={onSetFilters}
            searchInputText={searchInputText}
            setSearchInputText={setSearchInputText}
          />
        </ToolbarToggleGroup>
        <ColumnManagement columnLayout={columnLayout} hideColumnManagement={hideColumnManagement} />
      </ToolbarContent>
    </Toolbar>
  );
};

export default KubevirtFilterToolbar;
