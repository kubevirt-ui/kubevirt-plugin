import React, { FC, useEffect, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SearchInput } from '@patternfly/react-core';
import { CATALOG_FILTERS } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';
import { TemplateFilters } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/types';

type TemplatesSearchInputProps = {
  filters: TemplateFilters;
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void;
};

const TemplatesSearchInput: FC<TemplatesSearchInputProps> = ({ filters, onFilterChange }) => {
  const { t } = useKubevirtTranslation();
  const [query, setQuery] = useState<string>(filters?.query || '');

  const filterByKeywordMsg = t('Filter by keyword...');

  useEffect(
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
    <SearchInput
      onChange={(_, val) => {
        setQuery(val);
      }}
      onClear={() => {
        setQuery('');
        onFilterChange(CATALOG_FILTERS.QUERY, '');
      }}
      aria-label={filterByKeywordMsg}
      className="co-catalog-page__input"
      data-test="search-catalog"
      id="filter-text-input"
      placeholder={filterByKeywordMsg}
      type="text"
      value={filters?.query}
    />
  );
};

export default TemplatesSearchInput;
