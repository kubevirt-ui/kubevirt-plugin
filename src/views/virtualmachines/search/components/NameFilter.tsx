import React, { FC } from 'react';

import {
  STATIC_SEARCH_FILTERS_LABELS,
  STATIC_SEARCH_FILTERS_PLACEHOLDERS,
} from '@kubevirt-utils/components/ListPageFilter/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SearchInput, SearchInputProps, ToolbarFilter } from '@patternfly/react-core';

export type NameFilterProps = {
  inputText: string;
  onDelete: () => void;
  onTextChange: SearchInputProps['onChange'];
};

const NameFilter: FC<NameFilterProps> = ({ inputText, onDelete, onTextChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ToolbarFilter
      categoryName={t(STATIC_SEARCH_FILTERS_LABELS.name)}
      deleteLabel={onDelete}
      deleteLabelGroup={onDelete}
      labels={inputText ? [inputText] : []}
    >
      <SearchInput
        data-test="vm-filter-name-input"
        onChange={onTextChange}
        placeholder={t(STATIC_SEARCH_FILTERS_PLACEHOLDERS.name)}
        value={inputText}
      />
    </ToolbarFilter>
  );
};

export default NameFilter;
