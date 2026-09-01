/* eslint-disable */
import React, { FC, useState } from 'react';

import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUniversalFilter from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { SearchInput } from '@patternfly/react-core';

type TemplatesSearchInputProps = {
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

const TemplatesSearchInput: FC<TemplatesSearchInputProps> = ({ filters, onSetFilters }) => {
  const { t } = useKubevirtTranslation();
  const { setValueWithDebounce } = useUniversalFilter({ filters, onSetFilters });

  const filterNameValue = filters.name?.[0] ?? '';
  const [name, setName] = useState(filterNameValue);
  const [trackedFilterName, setTrackedFilterName] = useState(filterNameValue);

  if (trackedFilterName !== filterNameValue) {
    setTrackedFilterName(filterNameValue);
    setName(filterNameValue);
  }

  const filterByKeywordMsg = t('Filter by keyword...');

  const updateName = (val: string) => {
    setName(val);
    setValueWithDebounce('name', val);
  };

  return (
    <SearchInput
      aria-label={filterByKeywordMsg}
      className="co-catalog-page__input"
      data-test="search-catalog"
      id="filter-text-input"
      onChange={(_, val) => updateName(val)}
      onClear={() => updateName('')}
      placeholder={filterByKeywordMsg}
      type="text"
      value={name}
    />
  );
};

export default TemplatesSearchInput;
