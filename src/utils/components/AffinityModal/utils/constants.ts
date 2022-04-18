// import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { AffinityCondition, AffinityRowData, AffinityType } from './types';

export const TOPOLOGY_KEY_DEFAULT = 'kubernetes.io/hostname';

export const defaultNewAffinity = {
  type: AffinityType.node,
  condition: AffinityCondition.required,
  expressions: [],
  fields: [],
  topologyKey: TOPOLOGY_KEY_DEFAULT,
} as AffinityRowData;
