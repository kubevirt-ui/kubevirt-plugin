import { ReactNode } from 'react';

import { DataViewFilterOption } from '@patternfly/react-data-view';

export enum KubevirtFilterLayout {
  GROUPED = 'grouped',
  HIDDEN = 'hidden',
  SELECT = 'select',
}

export type KubevirtFilterOptionGroup = {
  label?: string;
  values: string[];
};

/**
 * Minimal structural type for filterable data objects.
 * Objects only need `metadata.name` for name filtering and `metadata.labels` for label filtering.
 */
export type FilterableObject = {
  metadata?: { labels?: Record<string, string>; name?: string };
};

export type KubevirtFilter<TData extends FilterableObject = FilterableObject> = {
  applyWhenEmpty?: boolean;
  categoryLabel?: string;
  categoryLabelShort?: string;
  defaultSelected?: string[];
  disabled?: boolean;
  disabledTooltip?: ReactNode;
  filterLayout?: KubevirtFilterLayout;
  getChipLabel?: (value: string) => string;
  hideCountBadge?: boolean;
  id: string;
  match: (obj: TData, selectedValues: string[]) => boolean;
  optionGroups?: KubevirtFilterOptionGroup[];
  options?: DataViewFilterOption[];
  showAllBadge?: boolean;
  toggleBadgeNumber?: number;
};

export type KubevirtFilterState = {
  [filterId: string]: string[];
  name: string[];
};

export type OnSetFilters = (newFilters: Partial<KubevirtFilterState>) => void;
