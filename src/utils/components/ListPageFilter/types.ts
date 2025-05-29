import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';

export type ApplyTextFilters = (type: string, value?: string | string[]) => void;

export type ListPageFiltersMethodsOutputs = {
  applyTextFilters: ApplyTextFilters;
  applyTextFiltersWithDebounce: ApplyTextFilters;
  clearAll: () => void;
  updateRowFilterSelected: (id: string[]) => void;
};

export type TextFiltersType = {
  labels?: string[];
  name?: string;
} & { [key: string]: string };

export type ResetTextSearch = (newTextFilters: TextFiltersType) => void;

export type ExposedFilterFunctions = {
  onFilterChange: OnFilterChange;
  resetTextSearch?: ResetTextSearch;
};
