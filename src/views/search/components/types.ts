import { type FormEvent, type KeyboardEvent, type RefObject } from 'react';

import {
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

export type SearchTextInputProps = {
  displayText: string;
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  inputRef: RefObject<HTMLInputElement>;
  isDraft: boolean;
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
