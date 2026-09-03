export type SearchItem = {
  description?: string;
  id: string;
  isDisabled?: boolean;
  title: string;
};

export type SearchItemWithTab = {
  element: SearchItem;
  tab: string;
};
