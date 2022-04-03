import * as React from 'react';

import { useInputDebounce } from '@kubevirt-utils/hooks/useInputDebounce';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  pluralize,
  Split,
  SplitItem,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { ListIcon, ThIcon } from '@patternfly/react-icons';

import { TemplateFilters } from '../hooks/useVmTemplatesFilters';
import { CATALOG_FILTERS } from '../utils/consts';

export const TemplatesCatalogHeader: React.FC<{
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: string | boolean) => void;
  itemCount: number;
}> = React.memo(({ filters, onFilterChange, itemCount }) => {
  const { t } = useKubevirtTranslation();
  const { inputRef } = useInputDebounce({
    delay: 150,
    updateURLParam: CATALOG_FILTERS.QUERY,
    onChange: (value) => onFilterChange(CATALOG_FILTERS.QUERY, value),
  });

  return (
    <div className="co-catalog-page__header">
      <div className="co-catalog-page__heading text-capitalize">
        {filters?.onlyDefault ? t('Default Templates') : t('All Items')}
      </div>
      <div className="co-catalog-page__filter">
        <TextInput
          className="co-catalog-page__input"
          ref={inputRef}
          type="text"
          id="filter-text-input"
          placeholder={t('Filter by name')}
          aria-label="filter text input"
        />

        <Split hasGutter>
          <SplitItem>
            <div className="co-catalog-page__num-items">{pluralize(itemCount, 'item')}</div>
          </SplitItem>
          <SplitItem>
            <ToggleGroup isCompact aria-label="list-or-grid-toggle">
              <ToggleGroupItem
                icon={<ListIcon />}
                aria-label="template list button"
                buttonId="template-list-btn"
                isSelected={filters?.isList}
                onChange={() => onFilterChange(CATALOG_FILTERS.IS_LIST, true)}
              />
              <ToggleGroupItem
                icon={<ThIcon />}
                aria-label="template grid button"
                buttonId="template-grid-btn"
                isSelected={!filters?.isList}
                onChange={() => onFilterChange(CATALOG_FILTERS.IS_LIST, false)}
              />
            </ToggleGroup>
          </SplitItem>
        </Split>
      </div>
    </div>
  );
});
TemplatesCatalogHeader.displayName = 'TemplatesCatalogHeader';
