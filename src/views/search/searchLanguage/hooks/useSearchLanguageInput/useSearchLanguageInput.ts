import { FormEvent, KeyboardEvent, useCallback, useMemo, useState } from 'react';

import { logVMSearchLanguageUsed } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { KeyTypes } from '@patternfly/react-core';
import { filtersToSearchText } from '@search/searchLanguage/filtersToSearchText';
import { getLastToken, isIncompleteToken } from '@search/searchLanguage/utils';
import { validateAndBuildFilterState } from '@search/searchLanguage/validateAndBuildFilterState/validateAndBuildFilterState';

import { updateFilterState } from '../useOnCommitText/updateFilterState';
import useSearchValidationToast from '../useSearchValidationToast/useSearchValidationToast';
import useTokenOrder from '../useTokenOrder/useTokenOrder';

import {
  CommitTextOptions,
  UseSearchLanguageInputProps,
  UseSearchLanguageInputResult,
} from './types';
import useDraftInput from './useDraftInput';

export const useSearchLanguageInput = ({
  addRecentSearch,
  clearAllFilters,
  filterDefinitions,
  filters,
  onSetFilters,
}: UseSearchLanguageInputProps): UseSearchLanguageInputResult => {
  const { setTokenOrder, tokenOrder, trackKey } = useTokenOrder(filters);
  const committedText = useMemo(
    () => filtersToSearchText(filters, tokenOrder),
    [filters, tokenOrder],
  );
  const { displayText, exitDraft, isDraft, setDraftText } = useDraftInput(committedText);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const onOpenDropdown = useCallback(() => setIsDropdownOpen(true), []);
  const onCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    exitDraft();
  }, [exitDraft]);

  const onClear = useCallback(() => {
    clearAllFilters();
    setTokenOrder([]);
    exitDraft();
  }, [clearAllFilters, setTokenOrder, exitDraft]);

  const onShowValidationToast = useSearchValidationToast();

  const onCommitText = useCallback(
    (text: string, options?: CommitTextOptions) => {
      const trimmed = text.trim().replace(/,+$/, '');

      if (!trimmed) {
        onClear();
        if (options?.closeDropdown) onCloseDropdown();
        return;
      }

      const {
        filterState: newFilters,
        invalidKeyErrors,
        invalidValueErrors,
        tokenOrder: newTokenOrder,
      } = validateAndBuildFilterState(trimmed, filterDefinitions);

      updateFilterState(filters, newFilters, onSetFilters);

      if (!isEmpty(newFilters)) {
        logVMSearchLanguageUsed(newFilters);
      }

      if (!isEmpty(invalidKeyErrors) || !isEmpty(invalidValueErrors)) {
        onShowValidationToast(invalidKeyErrors, invalidValueErrors);
      }

      setTokenOrder(newTokenOrder);

      const serialized = filtersToSearchText(newFilters, newTokenOrder);
      if (serialized) {
        addRecentSearch?.(serialized);
      }

      if (options?.addTrailingSpace) {
        setDraftText(serialized ? `${serialized} ` : '');
      } else {
        exitDraft();
      }

      if (options?.closeDropdown) {
        onCloseDropdown();
      }
    },
    [
      filterDefinitions,
      filters,
      onSetFilters,
      setTokenOrder,
      addRecentSearch,
      onShowValidationToast,
      onCloseDropdown,
      exitDraft,
      setDraftText,
      onClear,
    ],
  );

  const onChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, value: string) => {
      if (value.endsWith(KeyTypes.Space) && value.trim()) {
        if (isIncompleteToken(getLastToken(value.trim()))) return;
        onCommitText(value, { addTrailingSpace: true });
      } else {
        setDraftText(value);
        onOpenDropdown();
      }
    },
    [onCommitText, onOpenDropdown, setDraftText],
  );

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === KeyTypes.Escape) {
        onCloseDropdown();
        return;
      }

      if (event.key === KeyTypes.Enter) {
        event.preventDefault();
        if (isIncompleteToken(getLastToken(displayText))) return;
        onCommitText(displayText, { closeDropdown: true });
      }
    },
    [displayText, onCloseDropdown, onCommitText],
  );

  return {
    displayText,
    isDraft,
    isDropdownOpen,
    onChange,
    onClear,
    onCloseDropdown,
    onCommitText,
    onInputKeyDown,
    onOpenDropdown,
    setDraftText,
    trackKey,
  };
};
