import {
  getQueryArgument,
  removeQueryArgument,
  setQueryArgument,
} from '@console/internal/components/hooks';
import { K8sResourceKindReference } from '@console/internal/module/k8s';
import { RootState } from '@console/internal/redux';

import {
  DisplayFilters,
  TopologyDisplayFilterType,
  TopologyDisplayOption,
} from '../utils/types/topology-types';

import { DEFAULT_TOPOLOGY_FILTERS, EXPAND_GROUPS_FILTER_ID } from './const';

export const TOPOLOGY_SEARCH_FILTER_KEY = 'searchQuery';
export const TOPOLOGY_LABELS_FILTER_KEY = 'labels';

export enum NameLabelFilterValues {
  // t('kubevirt-plugin~Name')
  Name = 'Name',
  // t('kubevirt-plugin~Label')
  Label = 'Label',
}

export const onSearchChange = (searchQuery: string): void => {
  if (searchQuery.length > 0) {
    setQueryArgument(TOPOLOGY_SEARCH_FILTER_KEY, searchQuery);
  } else {
    removeQueryArgument(TOPOLOGY_SEARCH_FILTER_KEY);
  }
};

export const clearNameFilter = () => {
  onSearchChange('');
};
export const clearLabelFilter = () => {
  removeQueryArgument(TOPOLOGY_LABELS_FILTER_KEY);
};

export const clearAll = () => {
  clearNameFilter();
  clearLabelFilter();
};

export const getSupportedTopologyFilters = (state: RootState): string[] => {
  const topology = state?.plugins?.devconsole?.topology;
  return topology ? topology.get('supportedFilters') : DEFAULT_TOPOLOGY_FILTERS.map((f) => f.id);
};

export const getSupportedTopologyKinds = (state: RootState): { [key: string]: number } => {
  const topology = state?.plugins?.devconsole?.topology;
  return topology ? topology.get('supportedKinds') : {};
};

export const getTopologySearchQuery = () =>
  getQueryArgument(TOPOLOGY_SEARCH_FILTER_KEY) ??
  getQueryArgument(TOPOLOGY_LABELS_FILTER_KEY) ??
  '';

export const getFilterById = (id: string, filters: DisplayFilters): TopologyDisplayOption => {
  if (!filters) {
    return null;
  }
  return filters.find((f) => f.id === id);
};

export const isExpanded = (id: string, filters: DisplayFilters): boolean => {
  if (!filters) {
    return true;
  }
  const groupsExpanded = getFilterById(EXPAND_GROUPS_FILTER_ID, filters)?.value ?? true;
  if (!groupsExpanded) {
    return false;
  }
  const filter = getFilterById(id, filters);
  if (filter && filter.type === TopologyDisplayFilterType.expand) {
    return filter.value;
  }
  return true;
};

export const isShown = (id: string, filters: DisplayFilters): boolean => {
  if (!filters) {
    return true;
  }
  const filter = getFilterById(id, filters);
  if (filter && filter.type === TopologyDisplayFilterType.show) {
    return filter.value;
  }
  return true;
};

export const showKind = (kind: K8sResourceKindReference, filters: DisplayFilters): boolean => {
  if (!filters || !kind) {
    return true;
  }
  // If no kinds are shown, show all
  const shownKinds = filters.filter((f) => f.type === TopologyDisplayFilterType.kind && f.value);
  if (shownKinds.length === 0) {
    return true;
  }

  // Return filter value if it exists, otherwise filter it out since there are other set filters
  return getFilterById(kind, filters)?.value ?? false;
};
