import React, { FC, RefObject, useRef } from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import {
  KubevirtFilter,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  Popper,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Tooltip,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import useCommitToken from '@search/searchLanguage/hooks/useCommitToken/useCommitToken';
import { useSearchLanguageDropdown } from '@search/searchLanguage/hooks/useSearchLanguageDropdown/useSearchLanguageDropdown';
import { VM_SEARCH_INPUT_ID } from '@search/utils/constants';

import { useSearchLanguageInput } from '../searchLanguage/hooks/useSearchLanguageInput/useSearchLanguageInput';

import useRecentSearches from './SearchDropdown/hooks/useRecentSearches';
import SearchDropdown from './SearchDropdown/SearchDropdown';
import AdvancedSearchIcon from './AdvancedSearchIcon';

type SearchTextInputProps = {
  filterDefinitions: KubevirtFilter[];
  inputRef: RefObject<HTMLInputElement>;
  inputValue: string;
  onOpenAdvancedSearch: () => void;
  onSetFilters: OnSetFilters;
  setInputValue: (value: string) => void;
};

const SearchTextInput: FC<SearchTextInputProps> = ({
  filterDefinitions,
  inputRef,
  inputValue,
  onOpenAdvancedSearch,
  onSetFilters,
  setInputValue,
}) => {
  const { t } = useKubevirtTranslation();

  const toggleRef = useRef<HTMLDivElement>();
  const menuRef = useRef<HTMLDivElement>();

  const { addRecentSearch, recentSearches } = useRecentSearches();
  const commitToken = useCommitToken(onSetFilters, filterDefinitions, addRecentSearch);

  const { isDropdownOpen, onChange, onClear, onCloseDropdown, onInputFocus, onKeyDown } =
    useSearchLanguageInput({ commitToken, inputValue, setInputValue });

  const { onSelectExample, onSelectKey, onSelectRecentSearch } = useSearchLanguageDropdown({
    commitToken,
    onCloseDropdown,
    setInputValue,
  });

  useClickOutside([toggleRef, menuRef], onCloseDropdown);

  const searchInput = (
    <div className="pf-v6-u-w-100" ref={toggleRef}>
      <TextInputGroup data-test={VM_SEARCH_INPUT_ID} id={VM_SEARCH_INPUT_ID} innerRef={inputRef}>
        <TextInputGroupMain
          icon={<SearchIcon />}
          onChange={onChange}
          onFocus={onInputFocus}
          onKeyDown={onKeyDown}
          placeholder={t('Search virtual machines...')}
          value={inputValue}
        />
        <TextInputGroupUtilities>
          {inputValue && (
            <Button
              aria-label={t('Clear search')}
              icon={<TimesIcon />}
              onClick={onClear}
              variant="plain"
            />
          )}
          <Tooltip content={t('Advanced search')}>
            <Button
              aria-label={t('Advanced search')}
              data-test="vm-advanced-search-button"
              icon={<AdvancedSearchIcon isLarge />}
              onClick={onOpenAdvancedSearch}
              variant="plain"
            />
          </Tooltip>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </div>
  );

  const dropdown = (
    <div ref={menuRef}>
      <SearchDropdown
        filterDefinitions={filterDefinitions}
        onSelectExample={onSelectExample}
        onSelectKey={onSelectKey}
        onSelectRecentSearch={onSelectRecentSearch}
        recentSearches={recentSearches}
      />
    </div>
  );

  return <Popper isVisible={isDropdownOpen} popper={dropdown} trigger={searchInput} />;
};

export default SearchTextInput;
