import { TopologyDisplayFilterType } from '../utils/types/topology-types';

export const SHOW_POD_COUNT_FILTER_ID = 'show-pod-count';
export const SHOW_LABELS_FILTER_ID = 'show-labels';
export const EXPAND_APPLICATION_GROUPS_FILTER_ID = 'expand-app-groups';
export const EXPAND_GROUPS_FILTER_ID = 'expand-groups';

export const DEFAULT_TOPOLOGY_FILTERS = [
  {
    type: TopologyDisplayFilterType.expand,
    id: EXPAND_GROUPS_FILTER_ID,
    // t('kubevirt-plugin~Expand groups')
    labelKey: 'kubevirt-plugin~Expand groups',
    priority: 1,
    value: true,
  },
  {
    type: TopologyDisplayFilterType.show,
    id: SHOW_POD_COUNT_FILTER_ID,
    // t('kubevirt-plugin~Pod count')
    labelKey: 'kubevirt-plugin~Pod count',
    priority: 10,
    value: false,
  },
  {
    type: TopologyDisplayFilterType.show,
    id: SHOW_LABELS_FILTER_ID,
    // t('kubevirt-plugin~Labels')
    labelKey: 'kubevirt-plugin~Labels',
    priority: 900,
    value: true,
  },
  {
    type: TopologyDisplayFilterType.expand,
    id: EXPAND_APPLICATION_GROUPS_FILTER_ID,
    // t('kubevirt-plugin~Application groupings')
    labelKey: 'kubevirt-plugin~Application groupings',
    priority: 10,
    value: true,
  },
];

export const DEFAULT_SUPPORTED_FILTER_IDS = [SHOW_POD_COUNT_FILTER_ID, SHOW_LABELS_FILTER_ID];
