import React, { FC, RefObject, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Tooltip,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import { VM_SEARCH_INPUT_ID } from '@search/utils/constants';

import AdvancedSearchIcon from './AdvancedSearchIcon';

type SearchTextInputProps = {
  inputRef: RefObject<HTMLInputElement>;
  onEnterKeyDown: () => void;
  onOpenAdvancedSearch: () => void;
  setIsSearchSuggestBoxOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
};

const SearchTextInput: FC<SearchTextInputProps> = ({
  inputRef,
  onEnterKeyDown,
  onOpenAdvancedSearch,
  setIsSearchSuggestBoxOpen,
  setSearchQuery,
}) => {
  const { t } = useKubevirtTranslation();
  const [inputValue, setInputValue] = useState('');

  const debouncedSetSearchQuery = useMemo(() => debounce(setSearchQuery, 500), []);

  const onChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    debouncedSetSearchQuery(value);
  };

  const onClear = () => {
    debouncedSetSearchQuery.cancel();
    setInputValue('');
    setSearchQuery('');
  };

  const onInputClick = () => inputValue && setIsSearchSuggestBoxOpen(true);

  return (
    <TextInputGroup data-test={VM_SEARCH_INPUT_ID} id={VM_SEARCH_INPUT_ID} innerRef={inputRef}>
      <TextInputGroupMain
        onKeyDown={(e) => {
          if (!inputValue) {
            return;
          }
          if (e.key === 'Enter') {
            onEnterKeyDown();
          }
          if (e.key === 'Escape') {
            setIsSearchSuggestBoxOpen(false);
          }
        }}
        icon={<SearchIcon />}
        onChange={onChange}
        onClick={onInputClick}
        placeholder={t('Search virtual machines')}
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
  );
};

export default SearchTextInput;
