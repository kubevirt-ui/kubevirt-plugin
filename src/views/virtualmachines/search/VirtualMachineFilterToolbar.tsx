import React, { FC, useMemo } from 'react';

import HiddenFilterChips from '@kubevirt-utils/components/KubevirtFilterToolbar/components/HiddenFilterChips';
import SelectFilterItem from '@kubevirt-utils/components/KubevirtFilterToolbar/components/SelectFilterItem';
import { logVMListFiltered } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { getLabelFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getLabelFilter';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { ListPageBodySize } from '@virtualmachines/list/listPageBodySize';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

import NameFilter from './components/NameFilter';
import useNameFilter from './hooks/useNameFilter';
import { ACM_FILTERS_SHOWN_VM_LIST, FILTERS_SHOWN_VM_LIST } from './constants';

type VirtualMachineFilterToolbarProps = {
  className?: string;
  clearAllFilters: () => void;
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  isSearchResultsPage?: boolean;
  listPageBodySize?: ListPageBodySize;
  loaded?: boolean;
  onSetFilters: OnSetFilters;
};

const VirtualMachineFilterToolbar: FC<VirtualMachineFilterToolbarProps> = ({
  className,
  clearAllFilters,
  filterDefinitions,
  filters,
  isSearchResultsPage,
  listPageBodySize,
  loaded,
  onSetFilters,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();

  const filtersShown = isACMPage ? ACM_FILTERS_SHOWN_VM_LIST : FILTERS_SHOWN_VM_LIST;

  const selectFilters = useMemo(
    () =>
      filterDefinitions.filter(
        (f) =>
          f.filterLayout === KubevirtFilterLayout.SELECT &&
          (isSearchResultsPage || filtersShown.includes(f.id as VirtualMachineRowFilterType)),
      ),
    [filterDefinitions, isSearchResultsPage, filtersShown],
  );

  const hiddenFilters = useMemo(
    () => [
      ...filterDefinitions.filter((f) => f.filterLayout === KubevirtFilterLayout.HIDDEN),
      getLabelFilter(t),
    ],
    [filterDefinitions, t],
  );

  const useShortLabels = isSearchResultsPage && listPageBodySize !== ListPageBodySize.lg;

  const handleSetFilters: OnSetFilters = (newFilters) => {
    const filterType = Object.keys(newFilters)[0];
    if (filterType) logVMListFiltered({ filterType });
    onSetFilters(newFilters);
  };

  const nameFilter = useNameFilter(filters, handleSetFilters);

  if (!loaded) return null;

  return (
    <Toolbar
      clearAllFilters={() => {
        nameFilter.resetInputText();
        clearAllFilters();
      }}
      className={className}
      clearFiltersButtonText={t('Clear all filters')}
      data-test="filter-toolbar"
      id="filter-toolbar"
    >
      <ToolbarContent>
        {selectFilters.map((filterDef) => (
          <SelectFilterItem
            toggleTitle={
              useShortLabels
                ? filterDef.categoryLabelShort ?? filterDef.categoryLabel
                : filterDef.categoryLabel
            }
            filterDef={filterDef}
            filters={filters}
            key={filterDef.id}
            onSetFilters={handleSetFilters}
          />
        ))}
        <NameFilter {...nameFilter} />
        <HiddenFilterChips
          filters={filters}
          hiddenFilters={hiddenFilters}
          onSetFilters={handleSetFilters}
        />
      </ToolbarContent>
    </Toolbar>
  );
};

export default VirtualMachineFilterToolbar;
