import { ReactNode } from 'react';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { DataViewFilterOption } from '@patternfly/react-data-view';

export enum KubevirtFilterLayout {
  GROUPED = 'grouped',
  HIDDEN = 'hidden',
  SELECT = 'select',
}

export type KubevirtFilter<TData extends K8sResourceCommon = K8sResourceCommon> = {
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
  options?: DataViewFilterOption[];
  showAllBadge?: boolean;
  toggleBadgeNumber?: number;
};

export type KubevirtFilterState = {
  [filterId: string]: string[];
  name: string[];
};

export type OnSetFilters = (newFilters: Partial<KubevirtFilterState>) => void;
