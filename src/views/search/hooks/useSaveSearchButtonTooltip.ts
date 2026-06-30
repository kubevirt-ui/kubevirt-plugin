import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SavedSearchEntry } from '@search/savedSearches/types';
import { areQueriesEqual } from '@search/utils/query';

type UseSaveSearchButtonTooltipArgs = {
  isDraft: boolean;
  searches: SavedSearchEntry[];
  searchesInitiallyLoaded: boolean;
  searchesLoadError: Error;
  urlSearchQuery: string;
};

type UseSaveSearchButtonTooltipResult = {
  isDisabled: boolean;
  tooltipContent: string;
};

const useSaveSearchButtonTooltip = ({
  isDraft,
  searches,
  searchesInitiallyLoaded,
  searchesLoadError,
  urlSearchQuery,
}: UseSaveSearchButtonTooltipArgs): UseSaveSearchButtonTooltipResult => {
  const { t } = useKubevirtTranslation();

  const existingSearchName = useMemo(() => {
    if (!urlSearchQuery) return null;
    return searches.find(({ query }) => areQueriesEqual(query, urlSearchQuery))?.name;
  }, [urlSearchQuery, searches]);

  const isDisabled =
    !searchesInitiallyLoaded ||
    !!searchesLoadError ||
    isDraft ||
    !urlSearchQuery ||
    !!existingSearchName;

  const tooltipContent = useMemo(() => {
    if (searchesLoadError) return t('Failed to load saved searches');
    if (!searchesInitiallyLoaded) return t('Loading saved searches…');
    if (isDraft) return t('Apply your search to save it');
    if (!urlSearchQuery) return t('Add at least one filter first');
    if (existingSearchName)
      return t('This filter is already saved as "{{name}}"', { name: existingSearchName });
    return t('Save search');
  }, [searchesLoadError, searchesInitiallyLoaded, isDraft, urlSearchQuery, existingSearchName, t]);

  return {
    isDisabled,
    tooltipContent,
  };
};

export default useSaveSearchButtonTooltip;
