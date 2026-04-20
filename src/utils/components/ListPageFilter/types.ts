import { ReactNode } from 'react';

import { OnFilterChange, RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';

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

export type ExposedFilterFunctions = {
  onFilterChange: OnFilterChange;
};

export type FilterInfo = {
  filterGroupName: string;
  query: null | string;
};

export type ExtendedRowFilterItem = RowFilterItem & {
  content?: ReactNode;
};

export type ExtendedRowFilter<R = any> = Omit<RowFilter<R>, 'items'> & {
  items: ExtendedRowFilterItem[];
};
