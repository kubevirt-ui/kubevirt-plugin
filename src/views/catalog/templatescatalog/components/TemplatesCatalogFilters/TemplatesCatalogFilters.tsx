import React, { FC, memo, useMemo } from 'react';

import { CATALOG_FILTERS } from '@catalog/templatescatalog/utils/consts';
import { hasNoDefaultUserAllFilters } from '@catalog/templatescatalog/utils/helpers';
import { TemplateFilters } from '@catalog/templatescatalog/utils/types';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  HIDE_DEPRECATED_TEMPLATES_KEY,
  OS_NAME_LABELS,
  OS_NAME_TYPES,
  WORKLOADS,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template/utils/constants';
import { ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { VerticalTabs, VerticalTabsTab } from '@patternfly/react-catalog-view-extension';
import { FilterSidePanel } from '@patternfly/react-catalog-view-extension/dist/esm/components/FilterSidePanel';

import { TemplatesCatalogProjectsDropdown } from '../TemplatesCatalogProjectsDropdown/TemplatesCatalogProjectsDropdown';

import { TemplatesCatalogFiltersGroup } from './TemplatesCatalogFiltersGroup';

export const TemplatesCatalogFilters: FC<{
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
}> = memo(({ filters, onFilterChange }) => {
  const { t } = useKubevirtTranslation();

  const workloadsArchitectures = useHcoWorkloadArchitectures();
  const workloadsArchitecturesItems = useMemo(
    () =>
      workloadsArchitectures.map((arch) => ({
        label: arch,
        value: arch,
      })),
    [workloadsArchitectures],
  );

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
          title={t('All templates')}
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
      <FilterSidePanel id="vm-catalog-filter-panel">
        <TemplatesCatalogFiltersGroup
          filters={[
            { label: t('Hide deprecated templates'), value: HIDE_DEPRECATED_TEMPLATES_KEY },
          ]}
          onFilterClick={() =>
            onFilterChange(
              CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES,
              !filters?.hideDeprecatedTemplates,
            )
          }
          pickedFilters={
            new Set(filters?.hideDeprecatedTemplates ? [HIDE_DEPRECATED_TEMPLATES_KEY] : [])
          }
          groupKey={CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES}
        />
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
            label: WORKLOADS_LABELS?.[v] || v,
            value: v,
          }))}
          groupKey="workload"
          groupLabel={t('Workload')}
          onFilterClick={onFilterChange}
          pickedFilters={filters.workload}
        />
        <TemplatesCatalogFiltersGroup
          filters={workloadsArchitecturesItems}
          groupKey={CATALOG_FILTERS.ARCHITECTURE}
          groupLabel={ARCHITECTURE_TITLE}
          onFilterClick={onFilterChange}
          pickedFilters={filters.architecture}
        />
      </FilterSidePanel>
    </div>
  );
});
