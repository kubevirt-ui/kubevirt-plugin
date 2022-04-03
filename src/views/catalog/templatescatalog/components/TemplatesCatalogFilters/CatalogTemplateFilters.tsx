import * as React from 'react';

import { CATALOG_FILTERS } from '@catalog/templatescatalog/utils/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  OS_NAME_LABELS,
  OS_NAME_TYPES,
  WORKLOADS,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template/utils/constants';
import { VerticalTabs, VerticalTabsTab } from '@patternfly/react-catalog-view-extension';
import { FilterSidePanel } from '@patternfly/react-catalog-view-extension/dist/esm/components/FilterSidePanel';

import { TemplateFilters } from '../../hooks/useVmTemplatesFilters';

import { TemplateFilterGroup } from './CatalogTemplateFilterGroup';

export const CatalogTemplateFilters: React.FC<{
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: string | boolean) => void;
}> = React.memo(({ filters, onFilterChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="co-catalog-page__tabs">
      <VerticalTabs>
        <VerticalTabsTab
          data-test-id="catalog-template-filter-all-items"
          id={'all-templates'}
          title={t('All Items')}
          onActivate={() => onFilterChange(CATALOG_FILTERS.ONLY_DEFAULT, false)}
          active={!filters?.onlyDefault}
        />
        <VerticalTabsTab
          data-test-id="catalog-template-filter-default-templates"
          id={'default-templates'}
          title={t('Default Templates')}
          onActivate={() => onFilterChange(CATALOG_FILTERS.ONLY_DEFAULT, true)}
          active={filters?.onlyDefault}
        />
      </VerticalTabs>
      <FilterSidePanel className="co-catalog-page__tabs" id="vm-catalog-filter-panel">
        <TemplateFilterGroup
          groupKey={'boot-source-available'}
          pickedFilters={new Set(filters?.onlyAvailable ? ['only-available'] : [])}
          onFilterClick={() =>
            onFilterChange(CATALOG_FILTERS.ONLY_AVAILABLE, !filters?.onlyAvailable)
          }
          filters={[{ label: t('Boot source available'), value: 'only-available' }]}
        />
        <TemplateFilterGroup
          groupKey="osName"
          groupLabel={t('OS')}
          pickedFilters={filters.osName}
          onFilterClick={onFilterChange}
          filters={Object.values(OS_NAME_TYPES).map((v) => ({
            label: OS_NAME_LABELS?.[v],
            value: v,
          }))}
        />
        <TemplateFilterGroup
          groupKey="workload"
          groupLabel={t('Workload')}
          pickedFilters={filters.workload}
          onFilterClick={onFilterChange}
          filters={Object.values(WORKLOADS).map((v) => ({
            label: WORKLOADS_LABELS?.[v],
            value: v,
          }))}
        />
      </FilterSidePanel>
    </div>
  );
});
