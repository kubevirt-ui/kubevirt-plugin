import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useInputDebounce } from '@kubevirt-utils/hooks/useInputDebounce';
import { pluralize, TextInput } from '@patternfly/react-core';

import { TemplateFilters } from '../hooks/useVmTemplatesFilters';

export const TemplatesCatalogHeader: React.FC<{
  filters: TemplateFilters;
  onFilterChange: (type: string, value: string | boolean) => void;
  itemCount: number;
}> = React.memo(({ filters, onFilterChange, itemCount }) => {
  const { t } = useTranslation();
  const { inputRef } = useInputDebounce({
    delay: 150,
    updateURLParam: 'query',
    onChange: (value) => onFilterChange('query', value),
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
        <div className="co-catalog-page__num-items">{pluralize(itemCount, 'item')}</div>
      </div>
    </div>
  );
});
TemplatesCatalogHeader.displayName = 'TemplatesCatalogHeader';
