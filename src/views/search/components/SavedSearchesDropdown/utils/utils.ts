/* eslint-disable */
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type SavedSearchEntry } from '@search/savedSearches/types';

export const getSortedSavedsearches = (searches: SavedSearchEntry[], filterText: string) => {
  const sorted = [...searches].sort((a, b) => Number(b.isFavorited) - Number(a.isFavorited));
  if (!filterText) return sorted;
  const lower = filterText.toLowerCase();
  return sorted.filter(({ name }) => name.toLowerCase().includes(lower));
};

type SavedSearchesItemsToDisplay = {
  favoriteSavedSearchesItems: SavedSearchEntry[];
  otherSavedSearchesItems: SavedSearchEntry[];
  shouldDisplayDivider: boolean;
};

export const getSavedSearchesItemsToDisplay = (
  savedSearchesItems: SavedSearchEntry[],
): SavedSearchesItemsToDisplay => {
  const favoriteSavedSearchesItems = savedSearchesItems.filter((item) => item.isFavorited);
  const otherSavedSearchesItems = savedSearchesItems.filter((item) => !item.isFavorited);

  return {
    favoriteSavedSearchesItems,
    otherSavedSearchesItems,
    shouldDisplayDivider: !isEmpty(favoriteSavedSearchesItems) && !isEmpty(otherSavedSearchesItems),
  };
};
