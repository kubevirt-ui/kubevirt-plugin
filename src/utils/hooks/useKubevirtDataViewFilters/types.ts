import { DataViewFilterOption } from '@patternfly/react-data-view';

export enum KubevirtFilterLayout {
  GROUPED = 'grouped',
  SELECT = 'select',
}

export type KubevirtFilter<TData extends K8sResourceCommon = K8sResourceCommon> = {
  applyWhenEmpty?: boolean;
  categoryLabel?: string;
  defaultSelected?: string[];
  filterLayout?: KubevirtFilterLayout;
  hideCountBadge?: boolean;
  id: string;
  match: (obj: TData, selectedValues: string[]) => boolean;
  options: DataViewFilterOption[];
};

export type KubevirtFilterState = {
  [filterId: string]: string[];
  labels: string[];
  name: string[];
};
