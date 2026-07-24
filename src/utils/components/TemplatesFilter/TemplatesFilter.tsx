import React, { type FC } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUniversalFilter from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type OnFilterChange, type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Stack } from '@patternfly/react-core';

import TemplatesCategoryFilter from './components/TemplatesCategoryFilter';
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
  const { categoryFilter, commonFilters, openShiftTemplatesOnlyFilters, scopeFilter } =
    splitTemplateFilters(rowFilters);

  const isSidebar = variant === TemplatesFilterVariant.Sidebar;
  const isMenu = variant === TemplatesFilterVariant.Menu;

  useFilterDefaultTemplates(isSidebar, universalFilter);

  const FilterGroupComponent = isSidebar
    ? TemplatesSidebarCheckboxGroup
    : TemplatesMenuCheckboxGroup;

  return (
    <div className={classNames({ 'templates-catalog-sidebar': isSidebar })}>
      <Stack hasGutter={isSidebar}>
        {commonFilters.map((rowFilter) => (
          <FilterGroupComponent
            key={rowFilter.type}
            rowFilter={rowFilter}
            universalFilter={universalFilter}
          />
        ))}

        {categoryFilter && (
          <Stack className={classNames({ 'pf-v6-u-px-lg pf-v6-u-py-md': isMenu })} hasGutter>
            {!isEmpty(commonFilters) && <Divider />}
            <TemplatesCategoryFilter
              isMenu={isMenu}
              rowFilter={categoryFilter}
              universalFilter={universalFilter}
            />
          </Stack>
        )}

        <Stack className={classNames({ 'pf-v6-u-px-lg pf-v6-u-py-md': isMenu })} hasGutter>
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
            className={classNames({ 'pf-v6-u-pl-lg': isSidebar })}
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
