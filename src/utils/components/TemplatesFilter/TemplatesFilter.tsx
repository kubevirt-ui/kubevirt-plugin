import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUniversalFilter from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { OnFilterChange, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Stack } from '@patternfly/react-core';

import TemplatesMenuCheckboxGroup from './components/TemplatesMenuCheckboxGroup';
import TemplatesScopeFilter from './components/TemplatesScopeFilter';
import TemplatesSidebarCheckboxGroup from './components/TemplatesSidebarCheckboxGroup';
import useFilterDefaultTemplates from './hooks/useFilterDefaultTemplates';
import { TemplatesFilterVariant } from './types';
import splitTemplateFilters from './utils';

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
  const { commonFilters, openShiftTemplatesOnlyFilters, scopeFilter } =
    splitTemplateFilters(rowFilters);

  const isSidebar = variant === TemplatesFilterVariant.Sidebar;
  const isMenu = variant === TemplatesFilterVariant.Menu;

  useFilterDefaultTemplates(isSidebar, universalFilter);

  const FilterGroupComponent = isSidebar
    ? TemplatesSidebarCheckboxGroup
    : TemplatesMenuCheckboxGroup;

  return (
    <div className={isSidebar ? 'templates-catalog-sidebar' : null}>
      <Stack hasGutter={isSidebar}>
        {commonFilters.map((rowFilter) => (
          <FilterGroupComponent
            key={rowFilter.type}
            rowFilter={rowFilter}
            universalFilter={universalFilter}
          />
        ))}

        <Stack className={isMenu ? 'pf-v6-u-px-lg pf-v6-u-py-md' : null} hasGutter>
          <Divider />
          <h4 className="pf-v6-u-font-weight-bold">{t('OpenShift templates only')}</h4>
          <TemplatesScopeFilter
            isMenu={isMenu}
            scopeFilter={scopeFilter}
            universalFilter={universalFilter}
          />
        </Stack>

        {openShiftTemplatesOnlyFilters.map((rowFilter) => (
          <FilterGroupComponent
            className={isSidebar ? 'pf-v6-u-pl-lg' : null}
            key={rowFilter.type}
            rowFilter={rowFilter}
            universalFilter={universalFilter}
          />
        ))}
      </Stack>
    </div>
  );
};

export default TemplatesFilter;
