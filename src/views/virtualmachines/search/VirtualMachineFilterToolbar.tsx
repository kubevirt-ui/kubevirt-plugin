import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import GroupedCheckboxSelect from '@kubevirt-utils/components/GroupedCheckboxSelect/GroupedCheckboxSelect';
import HiddenFilterChips from '@kubevirt-utils/components/KubevirtFilterToolbar/components/HiddenFilterChips';
import SelectFilterItem from '@kubevirt-utils/components/KubevirtFilterToolbar/components/SelectFilterItem';
import { logVMListFiltered } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { getLabelFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getLabelFilter';
import { getNameFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getNameFilter';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import { MenuToggleSize, Toolbar, ToolbarContent } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

import { ACM_FILTERS_SHOWN_VM_LIST, FILTERS_SHOWN_VM_LIST } from './constants';

type VirtualMachineFilterToolbarProps = {
  className?: string;
  clearAllFilters: () => void;
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  loaded?: boolean;
  onSetFilters: OnSetFilters;
  vms?: V1VirtualMachine[];
};

const VirtualMachineFilterToolbar: FC<VirtualMachineFilterToolbarProps> = ({
  className,
  clearAllFilters,
  filterDefinitions,
  filters,
  loaded,
  onSetFilters,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();

  const filtersShown = isACMPage ? ACM_FILTERS_SHOWN_VM_LIST : FILTERS_SHOWN_VM_LIST;

  const selectFilters = useMemo(
    () =>
      filterDefinitions.filter(
        (f) =>
          f.filterLayout === KubevirtFilterLayout.SELECT &&
          filtersShown.includes(f.id as VirtualMachineRowFilterType),
      ),
    [filterDefinitions, filtersShown],
  );

  const chipOnlyFilters = useMemo(
    () =>
      filterDefinitions.filter(
        (f) => f.filterLayout === KubevirtFilterLayout.SELECT && !selectFilters.includes(f),
      ),
    [filterDefinitions, selectFilters],
  );

  const hiddenFilters = useMemo(
    () => [
      getNameFilter(t),
      getLabelFilter(t),
      ...chipOnlyFilters,
      ...filterDefinitions.filter((f) => f.filterLayout === KubevirtFilterLayout.HIDDEN),
    ],
    [filterDefinitions, chipOnlyFilters, t],
  );

  const handleSetFilters: OnSetFilters = (newFilters) => {
    const filterType = Object.keys(newFilters)[0];
    if (filterType) logVMListFiltered({ filterType });
    onSetFilters(newFilters);
  };

  if (!loaded) return null;

  return (
    <Toolbar
      className={className}
      clearAllFilters={clearAllFilters}
      clearFiltersButtonText={t('Clear all filters')}
      data-test="filter-toolbar"
      id="filter-toolbar"
    >
      <ToolbarContent>
        {selectFilters.map((filterDef) =>
          filterDef.optionGroups ? (
            <GroupedCheckboxSelect
              data={vms ?? []}
              filterDef={filterDef}
              filters={filters}
              key={filterDef.id}
              onSetFilters={handleSetFilters}
              toggleSize={MenuToggleSize.sm}
            />
          ) : (
            <SelectFilterItem
              filterDef={filterDef}
              filters={filters}
              key={filterDef.id}
              onSetFilters={handleSetFilters}
              toggleSize={MenuToggleSize.sm}
            />
          ),
        )}
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
