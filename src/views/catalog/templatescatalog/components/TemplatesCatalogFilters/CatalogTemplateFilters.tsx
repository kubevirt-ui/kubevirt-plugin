import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FLAVORS,
  OS_NAME_LABELS,
  OS_NAME_TYPES,
  SUPPORT_TYPES,
  WORKLOADS,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template/utils/constants';
import { VerticalTabs, VerticalTabsTab } from '@patternfly/react-catalog-view-extension';
import { FilterSidePanel } from '@patternfly/react-catalog-view-extension/dist/esm/components/FilterSidePanel';
import { capitalize } from '@patternfly/react-core';

import { TemplateFilters } from '../../hooks/useVmTemplatesFilters';

import { TemplateFilterGroup } from './CatalogTemplateFilterGroup';

export const CatalogTemplateFilters: React.FC<{
  filters: TemplateFilters;
  onFilterChange: (type: string, value: string | boolean) => void;
}> = React.memo(({ filters, onFilterChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="co-catalog-page__tabs">
      <VerticalTabs>
        <VerticalTabsTab
          data-test-id="catalog-template-filter-all-items"
          id={'all-templates'}
          title={t('All Items')}
          onActivate={() => onFilterChange('onlyDefault', false)}
          active={!filters?.onlyDefault}
        />
        <VerticalTabsTab
          data-test-id="catalog-template-filter-default-templates"
          id={'default-templates'}
          title={t('Default Templates')}
          onActivate={() => onFilterChange('onlyDefault', true)}
          active={filters?.onlyDefault}
        />
      </VerticalTabs>
      <FilterSidePanel className="co-catalog-page__tabs" id="vm-catalog-filter-panel">
        <TemplateFilterGroup
          groupKey="support"
          groupLabel={t('Support level')}
          pickedFilters={filters.support.value}
          onFilterClick={onFilterChange}
          filters={Object.values(SUPPORT_TYPES).map((v) => ({ label: capitalize(v), value: v }))}
        />
        <TemplateFilterGroup
          groupKey="osName"
          groupLabel={t('OS name')}
          pickedFilters={filters.osName.value}
          onFilterClick={onFilterChange}
          filters={Object.values(OS_NAME_TYPES).map((v) => ({
            label: OS_NAME_LABELS?.[v],
            value: v,
          }))}
        />
        <TemplateFilterGroup
          defaultExpanded={false}
          groupKey="workload"
          groupLabel={t('Workload')}
          pickedFilters={filters.workload.value}
          onFilterClick={onFilterChange}
          filters={Object.values(WORKLOADS).map((v) => ({
            label: WORKLOADS_LABELS?.[v],
            value: v,
          }))}
        />
        <TemplateFilterGroup
          defaultExpanded={false}
          groupKey="flavor"
          groupLabel={t('Flavor')}
          pickedFilters={filters.flavor.value}
          onFilterClick={onFilterChange}
          filters={Object.values(FLAVORS).map((v) => ({ label: capitalize(v), value: v }))}
        />
      </FilterSidePanel>
    </div>
  );
});
