import React, { FC, memo } from 'react';

import { CATALOG_FILTERS } from '@catalog/templatescatalog/utils/consts';
import { hasNoDefaultUserAllFilters } from '@catalog/templatescatalog/utils/helpers';
import { TemplateFilters } from '@catalog/templatescatalog/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  OS_NAME_LABELS,
  OS_NAME_TYPES,
  WORKLOADS,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template/utils/constants';
import { VerticalTabs, VerticalTabsTab } from '@patternfly/react-catalog-view-extension';
import { FilterSidePanel } from '@patternfly/react-catalog-view-extension/dist/esm/components/FilterSidePanel';

import { TemplatesCatalogProjectsDropdown } from '../TemplatesCatalogProjectsDropdown/TemplatesCatalogProjectsDropdown';

import { TemplatesCatalogFiltersGroup } from './TemplatesCatalogFiltersGroup';

export const TemplatesCatalogFilters: FC<{
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
}> = memo(({ filters, onFilterChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="co-catalog-page__tabs">
      <TemplatesCatalogProjectsDropdown
        onChange={(project) => onFilterChange(CATALOG_FILTERS.NAMESPACE, project)}
        selectedProject={filters.namespace}
      />

      <VerticalTabs>
        <VerticalTabsTab
          active={filters?.allItems}
          data-test-id="catalog-template-filter-all-items"
          id={'all-templates'}
          onActivate={() => onFilterChange(CATALOG_FILTERS.ALL_ITEMS, true)}
          title={t('All items')}
        />
        <VerticalTabsTab
          active={filters?.onlyDefault || hasNoDefaultUserAllFilters(filters)}
          data-test-id="catalog-template-filter-default-templates"
          id={'default-templates'}
          onActivate={() => onFilterChange(CATALOG_FILTERS.ONLY_DEFAULT, true)}
          title={t('Default templates')}
        />
        <VerticalTabsTab
          active={filters?.onlyUser}
          id={'user-templates'}
          onActivate={() => onFilterChange(CATALOG_FILTERS.ONLY_USER, true)}
          title={t('User templates')}
        />
      </VerticalTabs>
      <FilterSidePanel className="co-catalog-page__tabs" id="vm-catalog-filter-panel">
        <TemplatesCatalogFiltersGroup
          onFilterClick={() =>
            onFilterChange(CATALOG_FILTERS.ONLY_AVAILABLE, !filters?.onlyAvailable)
          }
          filters={[{ label: t('Boot source available'), value: 'only-available' }]}
          groupKey={'boot-source-available'}
          pickedFilters={new Set(filters?.onlyAvailable ? ['only-available'] : [])}
        />
        <TemplatesCatalogFiltersGroup
          filters={Object.values(OS_NAME_TYPES).map((v) => ({
            label: OS_NAME_LABELS?.[v],
            value: v,
          }))}
          groupKey="osName"
          groupLabel={t('Operating system')}
          onFilterClick={onFilterChange}
          pickedFilters={filters.osName}
        />
        <TemplatesCatalogFiltersGroup
          filters={Object.values(WORKLOADS).map((v) => ({
            label: WORKLOADS_LABELS?.[v],
            value: v,
          }))}
          groupKey="workload"
          groupLabel={t('Workload')}
          onFilterClick={onFilterChange}
          pickedFilters={filters.workload}
        />
      </FilterSidePanel>
    </div>
  );
});
