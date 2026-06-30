export type SavedSearchData = {
  description: string;
  isFavorited: boolean;
  query: string;
};

export type SavedSearchEntry = SavedSearchData & {
  name: string;
};
