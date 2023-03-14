import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  pluralize,
  SearchInput,
  Split,
  SplitItem,
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
  const [query, setQuery] = React.useState<string>(filters?.query || '');

  React.useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        onFilterChange(CATALOG_FILTERS.QUERY, query);
      }, 150);
      // Cancel the timeout if value changes (also on delay change or unmount)
      return () => {
        clearTimeout(handler);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query], // Only re-call effect if value or delay changes
  );

  return (
    <div className="co-catalog-page__header">
      <div className="co-catalog-page__heading text-capitalize">
        {filters?.onlyDefault ? t('Default Templates') : t('All Items')}
      </div>
      <div className="co-catalog-page__filter">
        <div>
          <SearchInput
            className="co-catalog-page__input"
            data-test="search-catalog"
            id="filter-text-input"
            type="text"
            placeholder={t('Filter by keyword...')}
            value={filters?.query}
            onChange={(_, val) => {
              setQuery(val);
            }}
            onClear={() => {
              setQuery('');
              onFilterChange(CATALOG_FILTERS.QUERY, '');
            }}
            aria-label={t('Filter by keyword...')}
          />
        </div>

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
