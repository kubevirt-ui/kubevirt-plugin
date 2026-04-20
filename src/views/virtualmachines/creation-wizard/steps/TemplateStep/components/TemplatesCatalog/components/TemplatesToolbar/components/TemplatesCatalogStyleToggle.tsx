import React, { FCC } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { ListIcon, ThIcon } from '@patternfly/react-icons';
import { CATALOG_FILTERS } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';
import { TemplateFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/types';

type TemplatesCatalogStyleToggleProps = {
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
};

const TemplatesCatalogStyleToggle: FCC<TemplatesCatalogStyleToggleProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <ToggleGroup aria-label="list-or-grid-toggle" isCompact>
      <ToggleGroupItem
        aria-label="template list button"
        buttonId="template-list-btn"
        icon={<ListIcon />}
        isSelected={filters?.isList}
        onChange={() => onFilterChange(CATALOG_FILTERS.IS_LIST, true)}
      />
      <ToggleGroupItem
        aria-label="template grid button"
        buttonId="template-grid-btn"
        icon={<ThIcon />}
        isSelected={!filters?.isList}
        onChange={() => onFilterChange(CATALOG_FILTERS.IS_LIST, false)}
      />
    </ToggleGroup>
  );
};

export default TemplatesCatalogStyleToggle;
