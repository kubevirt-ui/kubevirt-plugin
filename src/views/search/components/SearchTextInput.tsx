import React, { type FC, useRef } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Divider,
  Flex,
  Popper,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Tooltip,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import { VM_SEARCH_INPUT_ID } from '@search/utils/constants';

import AdvancedSearchIcon from './AdvancedSearchIcon';
import { useSearchDropdownHandlers } from './hooks/useSearchDropdownHandlers';
import { useSearchTextInputHandlers } from './hooks/useSearchTextInputHandlers';
import SaveSearchButton from './SaveSearchButton';
import SearchDropdown from './SearchDropdown/SearchDropdown';
import { type SearchTextInputProps } from './types';

const SearchTextInput: FC<SearchTextInputProps> = ({
  displayText,
  filterDefinitions,
  filters,
  inputRef,
  isDraft,
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

  const {
    autocompleteMode,
    menuRef,
    onSelectKey,
    onSelectOperator,
    onSelectValue,
    onToggleShowAllExamples,
    showAllExamples,
    updateCursorPosition,
  } = useSearchDropdownHandlers({
    displayText,
    filterDefinitions,
    filters,
    inputRef,
    onSetFilters,
    setDraftText,
    trackKey,
  });

  const toggleRef = useRef<HTMLDivElement>(null);

  const {
    focusedItemIndex,
    handleAdvancedSearchClick,
    handleChange,
    handleKeyDown,
    shouldShowDropdown,
  } = useSearchTextInputHandlers({
    autocompleteMode,
    displayText,
    filterDefinitions,
    inputRef,
    onChange,
    onCloseDropdown,
    onInputKeyDown,
    onOpenAdvancedSearch,
    onSelectKey,
    onSelectOperator,
    onSelectQueryText,
    onSelectValue,
    recentSearches,
    setDraftText,
    showAllExamples,
    toggleRef,
  });

  const searchInput = (
    <div className="pf-v6-u-w-100" ref={toggleRef}>
      <TextInputGroup data-test={VM_SEARCH_INPUT_ID} id={VM_SEARCH_INPUT_ID}>
        <TextInputGroupMain
          icon={<SearchIcon />}
          onChange={handleChange}
          onClick={updateCursorPosition}
          onFocus={onOpenDropdown}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursorPosition}
          placeholder={t('Search virtual machines...')}
          ref={inputRef}
          value={displayText}
        />
        <TextInputGroupUtilities>
          <Flex gap={{ default: 'gapSm' }}>
            {displayText && (
              <Button
                aria-label={t('Clear search')}
                icon={<TimesIcon />}
                onClick={onClear}
                variant={ButtonVariant.plain}
              />
            )}
            <Divider className="pf-v6-u-py-sm" orientation={{ default: 'vertical' }} />
            <SaveSearchButton isDraft={isDraft} />
            <Tooltip content={t('Advanced search')}>
              <Button
                aria-label={t('Advanced search')}
                data-test="vm-advanced-search-button"
                icon={<AdvancedSearchIcon isLarge />}
                onClick={handleAdvancedSearchClick}
                variant={ButtonVariant.plain}
              />
            </Tooltip>
          </Flex>
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

  return (
    <Popper
      isVisible={shouldShowDropdown(isDropdownOpen)}
      popper={dropdown}
      trigger={searchInput}
    />
  );
};

export default SearchTextInput;
