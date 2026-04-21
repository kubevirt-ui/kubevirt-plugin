import React, { FC, memo, useMemo } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  HIDE_DEPRECATED_TEMPLATES_KEY,
  OS_NAMES,
  WORKLOAD_ITEMS,
} from '@kubevirt-utils/resources/template/utils/constants';
import { ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { Icon, SelectGroup, SelectOption } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import {
  ONLY_AVAILABLE,
  USER_TEMPLATES_KEY,
} from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogFilters/utils/constants';
import { CATALOG_FILTERS } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';
import { TemplateFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/types';

import './TemplatesCatalogFilters.scss';

export const TemplatesCatalogFilters: FC<{
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
}> = memo(({ filters, onFilterChange }) => {
  const { t } = useKubevirtTranslation();

  const workloadsArchitectures = useHcoWorkloadArchitectures();
  const workloadsArchitecturesItems = useMemo(
    () =>
      workloadsArchitectures.map((arch) => ({
        id: arch,
        title: arch,
      })),
    [workloadsArchitectures],
  );

  const selectedFilters = useMemo(() => {
    const selected: string[] = [];
    if (filters.hideDeprecatedTemplates) {
      selected.push(HIDE_DEPRECATED_TEMPLATES_KEY);
    }
    if (filters.onlyUser) {
      selected.push(USER_TEMPLATES_KEY);
    }
    if (filters.onlyAvailable) {
      selected.push(ONLY_AVAILABLE);
    }
    selected.push(...Array.from(filters.osName));
    selected.push(...Array.from(filters.workload));
    selected.push(...Array.from(filters.architecture));
    return selected;
  }, [filters]);

  const onFilterSelect = (_, value: string) => {
    // Handle deprecated filter
    if (value === HIDE_DEPRECATED_TEMPLATES_KEY) {
      onFilterChange(CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES, !filters.hideDeprecatedTemplates);
      return;
    }

    // Handle only user templates filter
    if (value === USER_TEMPLATES_KEY) {
      onFilterChange(CATALOG_FILTERS.ONLY_USER, !filters.onlyUser);
      return;
    }

    // Handle boot source available filter
    if (value === ONLY_AVAILABLE) {
      onFilterChange(CATALOG_FILTERS.ONLY_AVAILABLE, !filters.onlyAvailable);
      return;
    }

    // Handle OS name filters
    if (OS_NAMES.some((item) => item.id === value)) {
      onFilterChange(CATALOG_FILTERS.OS_NAME, value);
      return;
    }

    // Handle workload filters
    if (WORKLOAD_ITEMS.some((item) => item.id === value)) {
      onFilterChange(CATALOG_FILTERS.WORKLOAD, value);
      return;
    }

    // Handle architecture filters
    if (workloadsArchitecturesItems.some((item) => item.id === value)) {
      onFilterChange(CATALOG_FILTERS.ARCHITECTURE, value);
      return;
    }
  };

  return (
    <FormPFSelect
      toggleProps={{
        icon: (
          <Icon>
            <FilterIcon />
          </Icon>
        ),
      }}
      className="templates-catalog-filters-dropdown"
      closeOnSelect={false}
      onSelect={onFilterSelect}
      selected={selectedFilters}
      selectedLabel={t('Filter')}
    >
      <SelectGroup label={t('User templates')}>
        <SelectOption
          data-test-row-filter={USER_TEMPLATES_KEY}
          hasCheckbox
          isSelected={filters.onlyUser}
          value={USER_TEMPLATES_KEY}
        >
          {t('User templates')}
        </SelectOption>
      </SelectGroup>

      <SelectGroup label={t('Deprecated')}>
        <SelectOption
          data-test-row-filter={HIDE_DEPRECATED_TEMPLATES_KEY}
          hasCheckbox
          isSelected={filters.hideDeprecatedTemplates}
          value={HIDE_DEPRECATED_TEMPLATES_KEY}
        >
          {t('Hide deprecated templates')}
        </SelectOption>
      </SelectGroup>

      <SelectGroup label={t('Boot source')}>
        <SelectOption
          data-test-row-filter={ONLY_AVAILABLE}
          hasCheckbox
          isSelected={filters.onlyAvailable}
          value={ONLY_AVAILABLE}
        >
          {t('Boot source available')}
        </SelectOption>
      </SelectGroup>

      <SelectGroup label={t('Operating system')}>
        {OS_NAMES.map((item) => (
          <SelectOption
            data-test-row-filter={item.id}
            hasCheckbox
            isSelected={filters.osName.has(item.id)}
            key={item.id}
            value={item.id}
          >
            {item.title}
          </SelectOption>
        ))}
      </SelectGroup>

      <SelectGroup label={t('Workload')}>
        {WORKLOAD_ITEMS.map((item) => (
          <SelectOption
            data-test-row-filter={item.id}
            hasCheckbox
            isSelected={filters.workload.has(item.id)}
            key={item.id}
            value={item.id}
          >
            {item.title}
          </SelectOption>
        ))}
      </SelectGroup>

      <SelectGroup label={ARCHITECTURE_TITLE}>
        {workloadsArchitecturesItems.map((item) => (
          <SelectOption
            data-test-row-filter={item.id}
            hasCheckbox
            isSelected={filters.architecture.has(item.id)}
            key={item.id}
            value={item.id}
          >
            {item.title}
          </SelectOption>
        ))}
      </SelectGroup>
    </FormPFSelect>
  );
});
