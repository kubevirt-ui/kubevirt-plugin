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
  itemCount: number;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
}> = React.memo(({ filters, itemCount, onFilterChange }) => {
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
            onChange={(_, val) => {
              setQuery(val);
            }}
            onClear={() => {
              setQuery('');
              onFilterChange(CATALOG_FILTERS.QUERY, '');
            }}
            aria-label={t('Filter by keyword...')}
            className="co-catalog-page__input"
            data-test="search-catalog"
            id="filter-text-input"
            placeholder={t('Filter by keyword...')}
            type="text"
            value={filters?.query}
          />
        </div>

        <Split hasGutter>
          <SplitItem>
            <div className="co-catalog-page__num-items">{pluralize(itemCount, 'item')}</div>
          </SplitItem>
          <SplitItem>
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
          </SplitItem>
        </Split>
      </div>
    </div>
  );
});
TemplatesCatalogHeader.displayName = 'TemplatesCatalogHeader';
