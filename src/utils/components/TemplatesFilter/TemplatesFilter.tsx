import React, { type FC, useEffect } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUniversalFilter from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type OnFilterChange, type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Stack } from '@patternfly/react-core';
import { TemplateFilterType } from '@templates/list/filters/types';

import TemplatesCategoryFilter from './components/TemplatesCategoryFilter';
import TemplatesMenuCheckboxGroup from './components/TemplatesMenuCheckboxGroup';
import TemplatesScopeFilter from './components/TemplatesScopeFilter';
import TemplatesSidebarCheckboxGroup from './components/TemplatesSidebarCheckboxGroup';
import TemplatesTypeFilter from './components/TemplatesTypeFilter';
import useFilterDefaultTemplates from './hooks/useFilterDefaultTemplates';
import { TemplatesFilterVariant } from './types';
import splitTemplateFilters, { getTemplateTypeSelectionStateFromFilter } from './utils';

import './TemplatesFilter.scss';

type TemplatesFilterProps = {
  onFilterChange: OnFilterChange;
  rowFilters: RowFilter<TemplateOrRequest>[];
  variant: TemplatesFilterVariant;
};

const TemplatesFilter: FC<TemplatesFilterProps> = ({
  onFilterChange,
  rowFilters,
  variant = TemplatesFilterVariant.Sidebar,
}) => {
  const { t } = useKubevirtTranslation();
  const universalFilter = useUniversalFilter({ onFilterChange });
  const { hasQueryKey, setValue } = universalFilter;
  const { categoryFilter, commonFilters, openShiftTemplatesOnlyFilters, scopeFilter, typeFilter } =
    splitTemplateFilters(rowFilters);

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

  return (
    <div className={classNames({ 'templates-catalog-sidebar': isSidebar })}>
      <Stack hasGutter={isSidebar}>
        {isSidebar && typeFilter && (
          <TemplatesTypeFilter
            rowFilter={typeFilter}
            typeSelection={typeSelection}
            universalFilter={universalFilter}
          />
        )}

        {commonFilters.map((rowFilter) => (
          <FilterGroupComponent
            key={rowFilter.type}
            rowFilter={rowFilter}
            universalFilter={universalFilter}
          />
        ))}

        {showVirtualMachineFilters && categoryFilter && (
          <Stack className={classNames({ 'pf-v6-u-px-lg pf-v6-u-py-md': isMenu })} hasGutter>
            {(!isEmpty(commonFilters) || (isSidebar && typeFilter)) && <Divider />}
            <h4 className="pf-v6-u-font-weight-bold">{t('VirtualMachine templates')}</h4>
            <TemplatesCategoryFilter
              isMenu={isMenu}
              rowFilter={categoryFilter}
              universalFilter={universalFilter}
            />
          </Stack>
        )}

        {showOpenShiftFilters && (
          <>
            <Stack className={classNames({ 'pf-v6-u-px-lg pf-v6-u-py-md': isMenu })} hasGutter>
              {!isEmpty(commonFilters) || (isSidebar && typeFilter && <Divider />)}
              <h4 className="pf-v6-u-font-weight-bold">{t('OpenShift templates only')}</h4>
              <TemplatesScopeFilter
                isMenu={isMenu}
                scopeFilter={scopeFilter}
                universalFilter={universalFilter}
              />
            </Stack>

            {openShiftTemplatesOnlyFilters.map((rowFilter) => (
              <FilterGroupComponent
                className={classNames({ 'pf-v6-u-pl-lg': isSidebar })}
                key={rowFilter.type}
                rowFilter={rowFilter}
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
