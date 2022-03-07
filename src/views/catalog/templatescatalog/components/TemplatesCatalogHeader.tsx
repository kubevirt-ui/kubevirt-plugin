import * as React from 'react';

import { useInputDebounce } from '@kubevirt-utils/hooks/useInputDebounce';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { pluralize, TextInput } from '@patternfly/react-core';

import { TemplateFilters } from '../hooks/useVmTemplatesFilters';

enum TAB_LABEL {
  'all' = 'All Items',
  'onlyDefault' = 'Default Templates',
  'onlyAvailable' = 'Boot source available',
}

export const TemplatesCatalogHeader: React.FC<{
  filters: TemplateFilters;
  onFilterChange: (type: string, value: string | boolean) => void;
  itemCount: number;
}> = React.memo(({ filters, onFilterChange, itemCount }) => {
  const { t } = useKubevirtTranslation();
  const { inputRef } = useInputDebounce({
    delay: 150,
    updateURLParam: 'query',
    onChange: (value) => onFilterChange('query', value),
  });

  return (
    <div className="co-catalog-page__header">
      <div className="co-catalog-page__heading text-capitalize">
        {t(TAB_LABEL[filters?.tabView])}
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
        <div className="co-catalog-page__num-items">{pluralize(itemCount, 'item')}</div>
      </div>
    </div>
  );
});
TemplatesCatalogHeader.displayName = 'TemplatesCatalogHeader';
