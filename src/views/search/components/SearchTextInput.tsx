import React, {
  FC,
  FormEvent,
  KeyboardEvent,
  RefObject,
  useCallback,
  useRef,
  useState,
} from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Popper,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Tooltip,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import { useSearchLanguageDropdown } from '@search/searchLanguage/hooks/useSearchLanguageDropdown/useSearchLanguageDropdown';
import { getLastToken } from '@search/searchLanguage/utils';
import { VM_SEARCH_INPUT_ID } from '@search/utils/constants';

import { useAutocompleteMode } from './SearchDropdown/hooks/useAutocompleteMode/useAutocompleteMode';
import { useDropdownNavigation } from './SearchDropdown/hooks/useDropdownNavigation/useDropdownNavigation';
import SearchDropdown from './SearchDropdown/SearchDropdown';
import { DropdownType } from './SearchDropdown/types';
import AdvancedSearchIcon from './AdvancedSearchIcon';

type SearchTextInputProps = {
  displayText: string;
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  inputRef: RefObject<HTMLInputElement>;
  isDropdownOpen: boolean;
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  onClear: () => void;
  onCloseDropdown: () => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onOpenAdvancedSearch: () => void;
  onOpenDropdown: () => void;
  onSelectQueryText: (query: string) => void;
  onSetFilters: OnSetFilters;
  recentSearches: string[];
  setDraftText: (value: string) => void;
  trackKey: (key: string) => void;
};

const SearchTextInput: FC<SearchTextInputProps> = ({
  displayText,
  filterDefinitions,
  filters,
  inputRef,
  isDropdownOpen,
  onChange,
  onClear,
  onCloseDropdown,
  onInputKeyDown,
  onOpenAdvancedSearch,
  onOpenDropdown,
  onSelectQueryText,
  onSetFilters,
  recentSearches,
  setDraftText,
  trackKey,
}) => {
  const { t } = useKubevirtTranslation();

  const toggleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showAllExamples, setShowAllExamples] = useState(false);
  const onToggleShowAllExamples = useCallback(() => setShowAllExamples((prev) => !prev), []);

  const lastToken = getLastToken(displayText);
  const autocompleteMode = useAutocompleteMode(lastToken, filterDefinitions);

  const { onSelectKey, onSelectOperator, onSelectValue } = useSearchLanguageDropdown({
    autocompleteMode,
    displayText,
    filters,
    onSetFilters,
    setDraftText,
    trackKey,
  });

  const { focusedItemIndex, handleKeyDown, resetFocusedItem } = useDropdownNavigation({
    autocompleteMode,
    filterDefinitions,
    onInputKeyDown,
    onSelectKey,
    onSelectOperator,
    onSelectQueryText,
    onSelectValue,
    recentSearches,
    showAllExamples,
  });

  const handleChange = useCallback(
    (event: FormEvent<HTMLInputElement>, value: string) => {
      resetFocusedItem();
      onChange(event, value);
    },
    [resetFocusedItem, onChange],
  );

  useClickOutside([toggleRef, menuRef], onCloseDropdown);

  const searchInput = (
    <div className="pf-v6-u-w-100" ref={toggleRef}>
      <TextInputGroup data-test={VM_SEARCH_INPUT_ID} id={VM_SEARCH_INPUT_ID}>
        <TextInputGroupMain
          icon={<SearchIcon />}
          onChange={handleChange}
          onFocus={onOpenDropdown}
          onKeyDown={handleKeyDown}
          placeholder={t('Search virtual machines...')}
          ref={inputRef}
          value={displayText}
        />
        <TextInputGroupUtilities>
          {displayText && (
            <Button
              aria-label={t('Clear search')}
              icon={<TimesIcon />}
              onClick={onClear}
              variant={ButtonVariant.plain}
            />
          )}
          <Tooltip content={t('Advanced search')}>
            <Button
              onClick={() => {
                onCloseDropdown();
                onOpenAdvancedSearch();
              }}
              aria-label={t('Advanced search')}
              data-test="vm-advanced-search-button"
              icon={<AdvancedSearchIcon isLarge />}
              variant={ButtonVariant.plain}
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
        onSelectKey={onSelectKey}
        onSelectOperator={onSelectOperator}
        onSelectQueryText={onSelectQueryText}
        onSelectValue={onSelectValue}
        onToggleShowAllExamples={onToggleShowAllExamples}
        recentSearches={recentSearches}
        showAllExamples={showAllExamples}
      />
    </div>
  );

  const shouldShowDropdown = isDropdownOpen && autocompleteMode.type !== DropdownType.HIDDEN;

  return <Popper isVisible={shouldShowDropdown} popper={dropdown} trigger={searchInput} />;
};

export default SearchTextInput;
