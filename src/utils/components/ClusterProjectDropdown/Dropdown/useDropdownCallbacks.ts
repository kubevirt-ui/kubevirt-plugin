import { type MouseEvent, type RefObject, useCallback } from 'react';

import { type DropdownBookmarks, type ShowSystemToggle } from './types';

type UseDropdownCallbacksParams = {
  bookmarks: DropdownBookmarks;
  filterRef: RefObject<HTMLInputElement>;
  onChange: (item: string) => void;
  setFilterText: (text: string) => void;
  setIsOpen: (open: boolean) => void;
  showSystemToggle?: ShowSystemToggle;
};

export const useDropdownCallbacks = ({
  bookmarks,
  filterRef,
  onChange,
  setFilterText,
  setIsOpen,
  showSystemToggle,
}: UseDropdownCallbacksParams): {
  onActionClick: (event: MouseEvent, itemID: string) => void;
  onClearFilters: (event: MouseEvent<HTMLButtonElement>) => void;
  onSelect: (event: MouseEvent, itemId: string) => void;
} => {
  const onSetFavorite = useCallback(
    async (key: string, active: boolean) => {
      if (!bookmarks.bookmarksLoaded || !bookmarks.updateBookmarks) return;

      const newBookmarks = { ...bookmarks.bookmarks };
      if (active) {
        newBookmarks[key] = true;
      } else {
        delete newBookmarks[key];
      }

      try {
        await bookmarks.updateBookmarks(newBookmarks);
      } catch {
        // Error handling is done in the hook
      }
    },
    [bookmarks],
  );

  const onSelect = useCallback(
    (_event: MouseEvent, itemId: string) => {
      setIsOpen(false);
      onChange(itemId);
    },
    [onChange, setIsOpen],
  );

  const onActionClick = useCallback(
    (event: MouseEvent, itemID: string) => {
      event.preventDefault();
      event.stopPropagation();
      const isCurrentFavorite = bookmarks.bookmarks?.[itemID];
      void onSetFavorite(itemID, !isCurrentFavorite);
    },
    [bookmarks.bookmarks, onSetFavorite],
  );

  const onClearFilters = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setFilterText('');
      if (showSystemToggle && !showSystemToggle.show) {
        showSystemToggle.onChange(true);
      }
      filterRef.current?.focus();
    },
    [showSystemToggle, setFilterText, filterRef],
  );

  return { onActionClick, onClearFilters, onSelect };
};
