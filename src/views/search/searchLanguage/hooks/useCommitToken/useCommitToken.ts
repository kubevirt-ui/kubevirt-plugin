import { useCallback, useMemo } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { parseSearchToken } from '@search/searchLanguage/parser';
import { tokenToFilterState } from '@search/searchLanguage/tokenToFilterState';

import { buildOptionsLookup, normalizeValue } from './utils';

type UseCommitTokenResult = (tokenText: string) => void;

const useCommitToken = (
  onSetFilters: OnSetFilters,
  filterDefinitions: KubevirtFilter[],
  addRecentSearch?: (token: string) => void,
): UseCommitTokenResult => {
  const optionsLookup = useMemo(() => buildOptionsLookup(filterDefinitions), [filterDefinitions]);

  const commitToken = useCallback(
    (tokenText: string) => {
      const trimmed = tokenText.trim();
      if (!trimmed) return;

      const token = parseSearchToken(trimmed);
      const filterUpdate = tokenToFilterState(token);
      if (!filterUpdate) return;

      const normalizedUpdate: Partial<KubevirtFilterState> = {};
      for (const [key, newValues] of Object.entries(filterUpdate)) {
        normalizedUpdate[key] = newValues.map((v) => normalizeValue(v, key, optionsLookup));
      }

      onSetFilters(normalizedUpdate);
      addRecentSearch?.(trimmed);
    },
    [onSetFilters, optionsLookup, addRecentSearch],
  );

  return commitToken;
};

export default useCommitToken;
