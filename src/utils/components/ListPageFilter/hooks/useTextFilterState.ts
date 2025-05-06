import { Dispatch, SetStateAction, useState } from 'react';

import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { SelectProps } from '@patternfly/react-core';

import { ResetTextSearch, TextFiltersType } from '../types';
import { getInitialSearchText, getInitialSearchType } from '../utils';

type UseTextFilterState = (inputs: {
  searchFilters: RowFilter[];
  textFilters: TextFiltersType;
  textFilterSelectOptionNames: Record<string, string>;
}) => {
  onSelect: SelectProps['onSelect'];
  resetTextSearch: ResetTextSearch;
  searchInputText: string;
  searchType: string;
  setSearchInputText: Dispatch<SetStateAction<string>>;
};

const useTextFilterState: UseTextFilterState = ({
  searchFilters,
  textFilters,
  textFilterSelectOptionNames,
}) => {
  const [searchType, setSearchType] = useState<string>(
    getInitialSearchType(searchFilters, textFilters, textFilterSelectOptionNames),
  );

  const [searchInputText, setSearchInputText] = useState<string>(
    getInitialSearchText(textFilters, searchType),
  );

  const onSelect = (_, value: string) => {
    setSearchInputText(getInitialSearchText(textFilters, value));
    setSearchType(value);
  };

  const resetTextSearch = (newTextFilters: TextFiltersType) => {
    const newSearchType = getInitialSearchType(
      searchFilters,
      newTextFilters,
      textFilterSelectOptionNames,
    );

    setSearchType(newSearchType);
    setSearchInputText(getInitialSearchText(newTextFilters, newSearchType));
  };

  return {
    onSelect,
    resetTextSearch,
    searchInputText,
    searchType,
    setSearchInputText,
  };
};

export default useTextFilterState;
