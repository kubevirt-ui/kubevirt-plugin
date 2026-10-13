import { type MouseEvent, useCallback } from 'react';

import { type DropdownBookmarks } from './types';

type UseDropdownBookmarkActionsParams = {
  bookmarks: DropdownBookmarks;
};

export const useDropdownBookmarkActions = ({
  bookmarks,
}: UseDropdownBookmarkActionsParams): {
  onActionClick: (event: MouseEvent, itemID: string) => void;
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

  const onActionClick = useCallback(
    (event: MouseEvent, itemID: string) => {
      event.preventDefault();
      event.stopPropagation();
      const isCurrentFavorite = bookmarks.bookmarks?.[itemID];
      void onSetFavorite(itemID, !isCurrentFavorite);
    },
    [bookmarks.bookmarks, onSetFavorite],
  );

  return { onActionClick };
};
