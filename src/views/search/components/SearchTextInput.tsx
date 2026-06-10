import React, { FC, RefObject, useCallback, useEffect, useRef, useState } from 'react';

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

import { useAutocompleteMode } from './SearchDropdown/hooks/useAutocompleteMode/useAutocompleteMode';
import { useKeyListNavigation } from './SearchDropdown/hooks/useKeyListNavigation/useKeyListNavigation';
import useRecentSearches from './SearchDropdown/hooks/useRecentSearches';
import { useValueListNavigation } from './SearchDropdown/hooks/useValueListNavigation/useValueListNavigation';
import SearchDropdown from './SearchDropdown/SearchDropdown';
import { DropdownType } from './SearchDropdown/types';
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);

  const onCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    setFocusedItemIndex(-1);
  }, []);
  const onOpenDropdown = useCallback(() => setIsDropdownOpen(true), []);

  const { addRecentSearch, recentSearches } = useRecentSearches();
  const commitToken = useCommitToken(onSetFilters, filterDefinitions, addRecentSearch);

  const autocompleteMode = useAutocompleteMode(inputValue.trimStart(), filterDefinitions);

  const { onSelectExample, onSelectKey, onSelectRecentSearch, onSelectValue } =
    useSearchLanguageDropdown({
      autocompleteMode,
      commitToken,
      inputValue,
      onCloseDropdown,
      setInputValue,
    });

  const { onArrowKey: onValueArrowKey, onSelectHighlighted: onValueSelectHighlighted } =
    useValueListNavigation({
      autocompleteMode,
      filterDefinitions,
      focusedItemIndex,
      onSelectValue,
      setFocusedItemIndex,
    });

  const { onArrowKey: onKeyArrowKey, onSelectHighlighted: onKeySelectHighlighted } =
    useKeyListNavigation({
      autocompleteMode,
      focusedItemIndex,
      onSelectKey,
      setFocusedItemIndex,
    });

  const onArrowKey = onValueArrowKey ?? onKeyArrowKey;
  const onSelectHighlighted = onValueSelectHighlighted ?? onKeySelectHighlighted;

  useEffect(() => {
    setFocusedItemIndex(-1);
  }, [autocompleteMode]);

  const { onChange, onClear, onInputFocus, onKeyDown } = useSearchLanguageInput({
    autocompleteMode,
    commitToken,
    filterDefinitions,
    inputValue,
    onArrowKey,
    onCloseDropdown,
    onOpenDropdown,
    onSelectHighlighted,
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
        autocompleteMode={autocompleteMode}
        filterDefinitions={filterDefinitions}
        focusedItemIndex={focusedItemIndex}
        onSelectExample={onSelectExample}
        onSelectKey={onSelectKey}
        onSelectRecentSearch={onSelectRecentSearch}
        onSelectValue={onSelectValue}
        recentSearches={recentSearches}
      />
    </div>
  );

  const shouldShowDropdown = isDropdownOpen && autocompleteMode.type !== DropdownType.HIDDEN;

  return <Popper isVisible={shouldShowDropdown} popper={dropdown} trigger={searchInput} />;
};

export default SearchTextInput;
