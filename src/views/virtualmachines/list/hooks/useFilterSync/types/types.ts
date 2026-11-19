import { type NavigateFunction } from 'react-router';

import type { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

export type GetFleetPathToolbarFiltersArgs = {
  namespace: string | undefined;
  searchParams: URLSearchParams;
};

export type SyncFleetToolbarFromQueryArgs = {
  namespace: string | undefined;
  onSetFilters: OnSetFilters;
  searchParams: URLSearchParams;
};

export type PathScope = {
  cluster: string | undefined;
  namespace: string | undefined;
};

export type WidenUrlPathForToolbarFiltersResult = {
  scope: PathScope;
  shouldNavigate: boolean;
};

export type NavigateToWidenedVmListPathParams = {
  isACMPage: boolean;
  navigate: NavigateFunction;
  scope: PathScope;
  searchParams: URLSearchParams;
};

export type ListClusterProjectQueryFilters = {
  clusterFilterValues: string[];
  clusterProjectQueryKey: string;
  projectFilterValues: string[];
};

export type FilterSyncPrevState = {
  cluster: string | undefined;
  clusterProjectQueryKey: string | undefined;
  namespace: string | undefined;
};
