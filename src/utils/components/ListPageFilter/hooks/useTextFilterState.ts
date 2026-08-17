import { type Dispatch, type SetStateAction, useState } from 'react';

import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { type SelectProps } from '@patternfly/react-core';

import { type TextFiltersType } from '../types';
import { getInitialSearchText, getInitialSearchType } from '../utils';

type UseTextFilterState = (inputs: {
  searchFilters: RowFilter[];
  textFilters: TextFiltersType;
  textFilterSelectOptionNames: Record<string, string>;
}) => {
  onSelect: SelectProps['onSelect'];
  searchInputText: string;
  searchType: string;
  setSearchInputText: Dispatch<SetStateAction<string>>;
};

const useTextFilterState: UseTextFilterState = ({
  searchFilters,
  textFilters,
  textFilterSelectOptionNames,
}) => {
  const [searchType, setSearchType] = useState<string>(() =>
    getInitialSearchType(searchFilters, textFilters, textFilterSelectOptionNames),
  );

  const [searchInputText, setSearchInputText] = useState<string>(() =>
    getInitialSearchText(textFilters, searchType),
  );

  const onSelect = (_event: unknown, value: string): void => {
    setSearchInputText(getInitialSearchText(textFilters, value));
    setSearchType(value);
  };

  return {
    onSelect,
    searchInputText,
    searchType,
    setSearchInputText,
  };
};

export default useTextFilterState;
