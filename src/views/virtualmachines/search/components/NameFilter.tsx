import React, { FC } from 'react';

import {
  STATIC_SEARCH_FILTERS_LABELS,
  STATIC_SEARCH_FILTERS_PLACEHOLDERS,
} from '@kubevirt-utils/components/ListPageFilter/constants';
import { SearchInput, SearchInputProps, ToolbarFilter } from '@patternfly/react-core';

export type NameFilterProps = {
  inputText: string;
  onDelete: () => void;
  onTextChange: SearchInputProps['onChange'];
};

const NameFilter: FC<NameFilterProps> = ({ inputText, onDelete, onTextChange }) => {
  return (
    <ToolbarFilter
      categoryName={STATIC_SEARCH_FILTERS_LABELS.name}
      deleteLabel={onDelete}
      deleteLabelGroup={onDelete}
      labels={inputText ? [inputText] : []}
    >
      <SearchInput
        data-test="vm-filter-name-input"
        onChange={onTextChange}
        placeholder={STATIC_SEARCH_FILTERS_PLACEHOLDERS.name}
        value={inputText}
      />
    </ToolbarFilter>
  );
};

export default NameFilter;
