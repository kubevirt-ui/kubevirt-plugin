export type DropdownOption = {
  disabled?: boolean;
  key: string;
  title: string;
  tooltip?: string;
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

export type ShowSystemToggle = {
  hasSystemItems: boolean;
  onChange: (showSystem: boolean) => void;
  show: boolean;
};

export type DropdownProps<T> = {
  bookmarks: DropdownBookmarks;
  config: DropdownConfig;
  disabled?: boolean;
  disabledItemTooltip?: string;
  disabledTooltip?: string;
  extractKey: (item: T) => string;
  extractTitle: (item: T) => string;
  includeAllItems?: boolean;
  isItemDisabled?: (key: string) => boolean;
  items: null | T[] | undefined;
  itemsLoaded: boolean;
  omittedItems?: string[];
  onChange: (item: string) => void;
  selectedItem: string;
  showSystemToggle?: ShowSystemToggle;
};
