import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useUniversalFilter from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { SearchInput } from '@patternfly/react-core';

type TemplatesSearchInputProps = {
  onFilterChange: OnFilterChange;
};

const TemplatesSearchInput: FC<TemplatesSearchInputProps> = ({ onFilterChange }) => {
  const { t } = useKubevirtTranslation();
  const { setValueWithDebounce } = useUniversalFilter({ onFilterChange });
  const [name, setName] = useState('');

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
