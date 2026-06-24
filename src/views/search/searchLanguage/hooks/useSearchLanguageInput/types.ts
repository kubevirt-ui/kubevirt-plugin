import { FormEvent, KeyboardEvent } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

export type CommitTextOptions = {
  addTrailingSpace?: boolean;
  closeDropdown?: boolean;
};

export type UseSearchLanguageInputProps = {
  addRecentSearch?: (token: string) => void;
  clearAllFilters: () => void;
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

export type UseSearchLanguageInputResult = {
  displayText: string;
  isDraft: boolean;
  isDropdownOpen: boolean;
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  onClear: () => void;
  onCloseDropdown: () => void;
  onCommitText: (text: string, options?: CommitTextOptions) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onOpenDropdown: () => void;
  setDraftText: (value: string) => void;
  trackKey: (key: string) => void;
};
