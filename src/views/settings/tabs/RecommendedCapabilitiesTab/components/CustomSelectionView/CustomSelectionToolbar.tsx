import React, { FC, useCallback, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  BulkSelect,
  BulkSelectValue,
} from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';
import {
  Content,
  ContentVariants,
  SearchInput,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { DataViewCheckboxFilter, type DataViewTrTree } from '@patternfly/react-data-view';

import InstallSelectedButton from '../InstallSelectedButton/InstallSelectedButton';
import { STATUS_COUNT_TEMPLATES } from '../../utils/constants';
import {
  type CapabilityFilterValues,
  CapabilityInstallState,
  type CapabilitySelectionState,
} from '../../utils/types';

type CustomSelectionToolbarProps = {
  clearAllFilters: () => void;
  filteredCount: number;
  filters: CapabilityFilterValues;
  installedCount: number;
  onSetFilters: (newFilters: Partial<CapabilityFilterValues>) => void;
  resourcesLoaded: boolean;
  selectableRows: DataViewTrTree[];
  selection: CapabilitySelectionState;
  totalCount: number;
  treeRows: DataViewTrTree[];
};

const CustomSelectionToolbar: FC<CustomSelectionToolbarProps> = ({
  clearAllFilters,
  filteredCount,
  filters,
  installedCount,
  onSetFilters,
  resourcesLoaded,
  selectableRows,
  selection,
  totalCount,
  treeRows,
}) => {
  const { t } = useKubevirtTranslation();

  const isAllSelected = !isEmpty(selectableRows) && selectableRows.every(selection.isSelected);
  const isPartiallySelected = !isAllSelected && selectableRows.some(selection.isSelected);

  const selectedCapabilityCount = useMemo(() => {
    const capabilityIds = new Set(treeRows.map((row) => row.id));
    return selection.selected.filter(({ id }) => capabilityIds.has(id)).length;
  }, [selection.selected, treeRows]);

  const handleBulkSelect = useCallback(
    (value: BulkSelectValue) => {
      if (value === BulkSelectValue.none || value === BulkSelectValue.nonePage) {
        selection.onSelect(false, selectableRows);
      } else {
        selection.onSelect(true, selectableRows);
      }
    },
    [selectableRows, selection],
  );

  const statusOptions = useMemo(
    () => [
      { label: t('Installed'), value: CapabilityInstallState.Installed },
      { label: t('Partially installed'), value: CapabilityInstallState.PartiallyInstalled },
      { label: t('Not installed'), value: CapabilityInstallState.NotInstalled },
    ],
    [t],
  );

  const countText = useMemo(() => {
    const singleStatus = filters.status.length === 1 ? filters.status[0] : undefined;
    const template = singleStatus
      ? STATUS_COUNT_TEMPLATES[singleStatus]
      : '{{count}} out of {{total}} capabilities installed';
    const count = singleStatus ? filteredCount : installedCount;

    return t(template, { count, total: totalCount });
  }, [filteredCount, filters.status, installedCount, t, totalCount]);

  return (
    <Toolbar clearAllFilters={clearAllFilters}>
      <ToolbarContent>
        <ToolbarItem>
          <BulkSelect
            canSelectAll
            onSelect={handleBulkSelect}
            pageCount={selectableRows.length}
            pagePartiallySelected={isPartiallySelected}
            pageSelected={isAllSelected}
            selectedCount={selectedCapabilityCount}
            totalCount={selectableRows.length}
          />
        </ToolbarItem>
        <ToolbarItem>
          <SearchInput
            onChange={(_event, value) => onSetFilters({ name: value })}
            onClear={() => onSetFilters({ name: '' })}
            placeholder={t('Search capabilities')}
            value={filters.name}
          />
        </ToolbarItem>
        <ToolbarItem>
          <DataViewCheckboxFilter
            filterId="status"
            onChange={(_event, values) => onSetFilters({ status: values })}
            options={statusOptions}
            placeholder={t('Status')}
            title={t('Status')}
            value={filters.status}
          />
        </ToolbarItem>
        <ToolbarItem>
          <InstallSelectedButton />
        </ToolbarItem>
        <ToolbarItem className="pf-v6-u-ml-auto">
          {resourcesLoaded ? (
            <Content component={ContentVariants.small}>{countText}</Content>
          ) : (
            <Skeleton width="160px" />
          )}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default CustomSelectionToolbar;
