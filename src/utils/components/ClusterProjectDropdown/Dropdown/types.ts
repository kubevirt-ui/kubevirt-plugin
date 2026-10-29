import type { ComponentType } from 'react';

import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

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

export type DropdownMenuFooterContext = {
  closeMenu: () => void;
  filterText: string;
};

export type DropdownCreateProjectMenuFooterProps = {
  initialCluster?: string;
  onProjectCreated: (project: K8sResourceCommon) => void;
};

export type DropdownMenuFooterComponentProps = DropdownMenuFooterContext &
  DropdownCreateProjectMenuFooterProps;

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
  isLoading?: boolean;
  items: null | T[] | undefined;
  itemsLoaded: boolean;
  menuFooter?: ComponentType<DropdownMenuFooterComponentProps>;
  menuFooterProps?: DropdownCreateProjectMenuFooterProps;
  omittedItems?: string[];
  onChange: (item: string) => void;
  preserveUnknownSelectedItem?: boolean;
  selectedItem: string;
  showSystemToggle?: ShowSystemToggle;
};

export type DropdownMenuContentProps<T> = {
  dropdownProps: DropdownProps<T>;
  filterText: string;
};
