import { MatchExpression } from '@openshift-console/dynamic-plugin-sdk';

export type IDEntity = {
  id: number;
};

export enum AffinityType {
  node = 'nodeAffinity',
  pod = 'podAffinity',
  podAnti = 'podAntiAffinity',
}

export enum AffinityCondition {
  required = 'requiredDuringSchedulingIgnoredDuringExecution',
  preferred = 'preferredDuringSchedulingIgnoredDuringExecution',
}

export type AffinityLabel = IDEntity & {
  key: string;
  values: string[];
  operator: MatchExpression['operator'];
};

export type AffinityRowData = {
  id: string;
  type: AffinityType;
  condition: AffinityCondition;
  weight?: number;
  topologyKey?: string;
  expressions?: AffinityLabel[];
  fields?: AffinityLabel[];
};
