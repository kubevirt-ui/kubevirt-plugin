import React, { FCC } from 'react';

import { Split, SplitItem } from '@patternfly/react-core';
import { TemplatesCatalogFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogFilters/TemplatesCatalogFilters';
import { TemplatesCatalogProjectsDropdown } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogProjectsDropdown/TemplatesCatalogProjectsDropdown';
import TemplatesCatalogStyleToggle from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogStyleToggle';
import TemplatesSearchInput from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesSearchInput';
import { CATALOG_FILTERS } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';
import { TemplateFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/types';

type TemplatesToolbarProps = {
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
};

const TemplatesToolbar: FCC<TemplatesToolbarProps> = ({ filters, onFilterChange }) => {
  return (
    <Split hasGutter>
      <SplitItem>
        <TemplatesCatalogProjectsDropdown
          onChange={(project) => onFilterChange(CATALOG_FILTERS.NAMESPACE, project)}
          selectedProject={filters.namespace}
        />
      </SplitItem>
      <SplitItem>
        <TemplatesCatalogFilters filters={filters} onFilterChange={onFilterChange} />
      </SplitItem>
      <SplitItem>
        <TemplatesSearchInput filters={filters} onFilterChange={onFilterChange} />
      </SplitItem>
      <SplitItem isFilled />
      <SplitItem>
        <TemplatesCatalogStyleToggle filters={filters} onFilterChange={onFilterChange} />
      </SplitItem>
    </Split>
  );
};

export default TemplatesToolbar;
