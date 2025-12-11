export type DropdownOption = {
  key: string;
  title: string;
};

export type DropdownBookmarks = {
  bookmarks: Record<string, boolean>;
  bookmarksLoaded: boolean;
  updateBookmarks:
    | ((bookmarks: Record<string, boolean>) => Promise<Record<string, boolean>>)
    | null;
};

export type DropdownConfig = {
  allItemsKey: string;
  allItemsTitle: string;
  cssPrefix: string;
  dataTestId: string;
  itemsLabel: string;
  noItemsFoundTitle: string;
  selectPlaceholder: string;
};
