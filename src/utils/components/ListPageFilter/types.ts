import { type ReactNode } from 'react';

import {
  type ColumnLayout,
  type K8sResourceCommon,
  type OnFilterChange,
  type RowFilter,
  type RowFilterItem,
} from '@openshift-console/dynamic-plugin-sdk';

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

export type FilterInfo = {
  filterGroupName: string;
  query: null | string;
};

export type ExtendedRowFilterItem = RowFilterItem & {
  content?: ReactNode;
};

export type ExtendedRowFilter<R = unknown> = Omit<RowFilter<R>, 'items'> & {
  items: ExtendedRowFilterItem[];
};

export type ListPageFilterProps = {
  className?: string;
  columnLayout?: ColumnLayout;
  customRowFiltersMenu?: ReactNode;
  data?: K8sResourceCommon[];
  filtersWithSelect?: RowFilter[];
  hideColumnManagement?: boolean;
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  loaded?: boolean;
  nameFilterPlaceholder?: string;
  onFilterChange?: OnFilterChange;
  rowFilters?: RowFilter[];
  searchFilters?: RowFilter[];
  toolbarEndContent?: ReactNode;
  toolbarStartContent?: ReactNode;
};
