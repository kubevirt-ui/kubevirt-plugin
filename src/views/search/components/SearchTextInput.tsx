import React, { FC, RefObject } from 'react';

import {
  KubevirtFilter,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
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

import { useSearchLanguageInput } from '../searchLanguage/hooks/useSearchLanguageInput/useSearchLanguageInput';

import AdvancedSearchIcon from './AdvancedSearchIcon';

type SearchTextInputProps = {
  filterDefinitions: KubevirtFilter[];
  inputRef: RefObject<HTMLInputElement>;
  onOpenAdvancedSearch: () => void;
  onSetFilters: OnSetFilters;
};

const SearchTextInput: FC<SearchTextInputProps> = ({
  filterDefinitions,
  inputRef,
  onOpenAdvancedSearch,
  onSetFilters,
}) => {
  const { t } = useKubevirtTranslation();
  const { inputValue, onChange, onClear, onKeyDown } = useSearchLanguageInput(
    onSetFilters,
    filterDefinitions,
  );

  return (
    <TextInputGroup data-test={VM_SEARCH_INPUT_ID} id={VM_SEARCH_INPUT_ID} innerRef={inputRef}>
      <TextInputGroupMain
        icon={<SearchIcon />}
        onChange={onChange}
        onKeyDown={onKeyDown}
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
