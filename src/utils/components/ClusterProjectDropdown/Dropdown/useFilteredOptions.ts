import { useMemo } from 'react';
import fuzzysearch from 'fuzzysearch';

import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';

import { type DropdownBookmarks, type DropdownOption, type ShowSystemToggle } from './types';

type UseFilteredOptionsParams = {
  bookmarks: DropdownBookmarks;
  filterText: string;
  optionItems: DropdownOption[];
  showSystemToggle?: ShowSystemToggle;
};

export const useFilteredOptions = ({
  bookmarks,
  filterText,
  optionItems,
  showSystemToggle,
}: UseFilteredOptionsParams): {
  filteredFavorites: DropdownOption[];
  filteredOptions: DropdownOption[];
} =>
  useMemo(() => {
    const favorites: DropdownOption[] = [];
    const regular: DropdownOption[] = [];

    const showSystemNamespaces = showSystemToggle?.show ?? true;

    for (const option of optionItems) {
      const isFav = !!bookmarks.bookmarks?.[option.key];
      const matchesFilter = (fuzzysearch as (needle: string, haystack: string) => boolean)(
        filterText.toLowerCase(),
        option.title.toLowerCase(),
      );

      if (!matchesFilter) continue;

      if (isFav) {
        favorites.push(option);
        continue;
      }

      const isSystemItem = showSystemToggle ? isSystemNamespace(option.key) : false;
      if (!showSystemNamespaces && isSystemItem) continue;

      regular.push(option);
    }

    return { filteredFavorites: favorites, filteredOptions: regular };
  }, [optionItems, filterText, bookmarks.bookmarks, showSystemToggle]);
