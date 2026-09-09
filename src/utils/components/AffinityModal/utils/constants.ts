// import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { AffinityCondition, type AffinityRowData, AffinityType } from './types';

export const TOPOLOGY_KEY_DEFAULT = 'kubernetes.io/hostname';

export const defaultNewAffinity = {
  condition: AffinityCondition.Required,
  expressions: [],
  fields: [],
  topologyKey: TOPOLOGY_KEY_DEFAULT,
  type: AffinityType.Node,
} as AffinityRowData;
