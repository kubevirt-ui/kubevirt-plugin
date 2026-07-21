import React, { type FC, useMemo, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import GroupedCheckboxSelect from '@kubevirt-utils/components/GroupedCheckboxSelect/GroupedCheckboxSelect';
import HiddenFilterChips from '@kubevirt-utils/components/KubevirtFilterToolbar/components/HiddenFilterChips';
import SelectFilterItem from '@kubevirt-utils/components/KubevirtFilterToolbar/components/SelectFilterItem';
import { logVMListFiltered } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { getLabelFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getLabelFilter';
import { getNameFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getNameFilter';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  MenuToggleSize,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { type VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

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
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const filtersShown = isACMPage ? ACM_FILTERS_SHOWN_VM_LIST : FILTERS_SHOWN_VM_LIST;

  const selectFilters = useMemo(
    () =>
      filterDefinitions.filter(
        (filterDef) => filterDef.filterLayout === KubevirtFilterLayout.SELECT,
      ),
    [filterDefinitions],
  );

  const hiddenFilters = useMemo(
    () => [
      getNameFilter(t),
      getLabelFilter(t),
      ...filterDefinitions.filter(
        (filterDef) => filterDef.filterLayout === KubevirtFilterLayout.HIDDEN,
      ),
    ],
    [filterDefinitions, t],
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
        {selectFilters.map((filterDef) => {
          const sharedProps = {
            filterDef,
            filters,
            isToggleVisible:
              filtersShown.includes(filterDef.id as VirtualMachineRowFilterType) || showMoreFilters,
            key: filterDef.id,
            onSetFilters: handleSetFilters,
            toggleSize: MenuToggleSize.sm,
          };

          return filterDef.optionGroups ? (
            <GroupedCheckboxSelect {...sharedProps} data={vms ?? []} />
          ) : (
            <SelectFilterItem {...sharedProps} />
          );
        })}
        <ToolbarItem>
          <Button
            onClick={() => setShowMoreFilters((prev) => !prev)}
            size={ButtonSize.sm}
            variant={ButtonVariant.link}
          >
            {showMoreFilters ? t('Show less filters') : t('Show more filters')}
          </Button>
        </ToolbarItem>
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
