import React, { FC, Ref, useState } from 'react';
import { TFunction } from 'i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Badge,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  Title,
  ToolbarItem,
} from '@patternfly/react-core';
import { DataViewToolbar } from '@patternfly/react-data-view';
import { FilterIcon } from '@patternfly/react-icons';

import { DIAGNOSTIC_CATEGORIES, DIAGNOSTIC_CONDITIONS } from '../../utils/constants';
import { DiagnosticFilterCounts, DiagnosticFilters } from '../../utils/types';

import './diagnostics-issues-toolbar.scss';

type DiagnosticsIssuesToolbarProps = {
  filterCounts: DiagnosticFilterCounts;
  filters: DiagnosticFilters;
  onFiltersChange: (filters: DiagnosticFilters) => void;
  onSearchChange: (value: string) => void;
  searchText: string;
};

const toggleSetItem = (set: Set<string>, item: string): Set<string> => {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
};

const renderFilterOptions = (
  options: string[],
  selectedSet: Set<string>,
  counts: Record<string, number>,
  t: TFunction,
) =>
  options.map((option) => (
    <SelectOption hasCheckbox isSelected={selectedSet.has(option)} key={option} value={option}>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsMd' }}
      >
        <FlexItem>{t(option)}</FlexItem>
        <FlexItem>
          <Badge isRead>{counts[option] ?? 0}</Badge>
        </FlexItem>
      </Flex>
    </SelectOption>
  ));

const DiagnosticsIssuesToolbar: FC<DiagnosticsIssuesToolbarProps> = ({
  filterCounts,
  filters,
  onFiltersChange,
  onSearchChange,
  searchText,
}) => {
  const { t } = useKubevirtTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = filters.categories.size + filters.conditions.size;

  const handleSelect = (_event: React.MouseEvent, value: string) => {
    if ((DIAGNOSTIC_CATEGORIES as string[]).includes(value)) {
      onFiltersChange({ ...filters, categories: toggleSetItem(filters.categories, value) });
    } else {
      onFiltersChange({ ...filters, conditions: toggleSetItem(filters.conditions, value) });
    }
  };

  const clearAll = () => {
    onFiltersChange({ categories: new Set(), conditions: new Set() });
    onSearchChange('');
  };

  const filterToggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      badge={activeFilterCount > 0 ? <Badge isRead>{activeFilterCount}</Badge> : undefined}
      icon={<FilterIcon />}
      isExpanded={isFilterOpen}
      onClick={() => setIsFilterOpen((prev) => !prev)}
      ref={toggleRef}
    >
      {t('Filter')}
    </MenuToggle>
  );

  const filterSelect = (
    <Select
      isOpen={isFilterOpen}
      onOpenChange={setIsFilterOpen}
      onSelect={handleSelect}
      toggle={filterToggle}
    >
      <SelectList>
        <SelectGroup key="category" label={t('Category')}>
          {renderFilterOptions(
            DIAGNOSTIC_CATEGORIES,
            filters.categories,
            filterCounts.categories,
            t,
          )}
        </SelectGroup>
        <SelectGroup key="conditions" label={t('Conditions')}>
          {renderFilterOptions(
            DIAGNOSTIC_CONDITIONS,
            filters.conditions,
            filterCounts.conditions,
            t,
          )}
        </SelectGroup>
      </SelectList>
    </Select>
  );

  return (
    <div className="diagnostics-issues-toolbar">
      <Title className="pf-v6-u-mb-sm" headingLevel="h3">
        {t('Issues')}
      </Title>
      <DataViewToolbar clearAllFilters={clearAll} filters={filterSelect}>
        <ToolbarItem>
          <SearchInput
            aria-label={t('Search diagnostics')}
            data-test="diagnostics-search"
            onChange={(_event, value) => onSearchChange(value)}
            onClear={() => onSearchChange('')}
            placeholder={t('Search by reason, message...')}
            value={searchText}
          />
        </ToolbarItem>
      </DataViewToolbar>
    </div>
  );
};

export default DiagnosticsIssuesToolbar;
