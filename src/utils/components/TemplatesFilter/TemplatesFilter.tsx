import classNames from 'classnames';
import React, { type FC, useEffect } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack } from '@patternfly/react-core';
import { TemplateFilterType } from '@templates/list/filters/types';

import useUniversalFilter from '../../hooks/useUniversalFilter/useUniversalFilter';
import TemplatesCategoryFilter from './components/TemplatesCategoryFilter';
import TemplatesMenuCheckboxGroup from './components/TemplatesMenuCheckboxGroup';
import TemplatesScopeFilter from './components/TemplatesScopeFilter';
import TemplatesSectionHeading from './components/TemplatesSectionHeading';
import TemplatesSidebarCheckboxGroup from './components/TemplatesSidebarCheckboxGroup';
import TemplatesTypeFilter from './components/TemplatesTypeFilter';
import useFilterDefaultTemplates from './hooks/useFilterDefaultTemplates';
import { TemplatesFilterVariant } from './types';
import splitTemplateFilters, { getTemplateTypeSelectionStateFromFilter } from './utils';

import './TemplatesFilter.scss';

type TemplatesFilterProps = {
  filterDefinitions: KubevirtFilter<TemplateOrRequest>[];
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
  variant: TemplatesFilterVariant;
};

const TemplatesFilter: FC<TemplatesFilterProps> = ({
  filterDefinitions,
  filters,
  onSetFilters,
  variant = TemplatesFilterVariant.Sidebar,
}) => {
  const { t } = useKubevirtTranslation();
  const universalFilter = useUniversalFilter({ filters, onSetFilters });
  const { hasQueryKey, setValue } = universalFilter;
  const { categoryFilter, commonFilters, openShiftTemplatesOnlyFilters, scopeFilter, typeFilter } =
    splitTemplateFilters(filterDefinitions);

  const isSidebar = variant === TemplatesFilterVariant.Sidebar;
  const isMenu = variant === TemplatesFilterVariant.Menu;

  useFilterDefaultTemplates(isSidebar, universalFilter);

  const FilterGroupComponent = isSidebar
    ? TemplatesSidebarCheckboxGroup
    : TemplatesMenuCheckboxGroup;

  const typeSelection = getTemplateTypeSelectionStateFromFilter({
    hasQueryKey: universalFilter.hasQueryKey,
    isSelected: universalFilter.isSelected,
  });
  const { showOpenShiftFilters, showVirtualMachineFilters } = typeSelection;

  // Category rejects non-VMTs when set; clear it when the VMT section is hidden.
  useEffect(() => {
    if (!showVirtualMachineFilters && hasQueryKey(TemplateFilterType.Category)) {
      setValue(TemplateFilterType.Category);
    }
  }, [hasQueryKey, setValue, showVirtualMachineFilters]);

  const showSectionDivider = !isEmpty(commonFilters) || (isSidebar && !!typeFilter);

  return (
    <div className={classNames({ 'templates-catalog-sidebar': isSidebar })}>
      <Stack hasGutter={isSidebar}>
        {isSidebar && typeFilter && (
          <TemplatesTypeFilter
            filterDefinition={typeFilter}
            typeSelection={typeSelection}
            universalFilter={universalFilter}
          />
        )}

        {commonFilters.map((filterDef) => (
          <FilterGroupComponent
            filterDefinition={filterDef}
            key={filterDef.id}
            universalFilter={universalFilter}
          />
        ))}

        {showVirtualMachineFilters && categoryFilter && (
          <TemplatesSectionHeading
            isMenu={isMenu}
            showDivider={showSectionDivider}
            title={t('VirtualMachine templates')}
          >
            <TemplatesCategoryFilter
              filterDefinition={categoryFilter}
              isMenu={isMenu}
              universalFilter={universalFilter}
            />
          </TemplatesSectionHeading>
        )}

        {showOpenShiftFilters && (
          <>
            <TemplatesSectionHeading
              isMenu={isMenu}
              showDivider={showSectionDivider}
              title={t('OpenShift templates')}
            >
              <TemplatesScopeFilter
                isMenu={isMenu}
                scopeFilter={scopeFilter}
                universalFilter={universalFilter}
              />
            </TemplatesSectionHeading>

            {openShiftTemplatesOnlyFilters.map((filterDef) => (
              <FilterGroupComponent
                filterDefinition={filterDef}
                key={filterDef.id}
                universalFilter={universalFilter}
              />
            ))}
          </>
        )}
      </Stack>
    </div>
  );
};

export default TemplatesFilter;
