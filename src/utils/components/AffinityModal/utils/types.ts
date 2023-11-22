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
  preferred = 'preferredDuringSchedulingIgnoredDuringExecution',
  required = 'requiredDuringSchedulingIgnoredDuringExecution',
}

export type AffinityLabel = IDEntity & {
  key: string;
  operator: MatchExpression['operator'];
  values: string[];
};

export type AffinityRowData = {
  condition: AffinityCondition;
  expressions?: AffinityLabel[];
  fields?: AffinityLabel[];
  id: string;
  topologyKey?: string;
  type: AffinityType;
  weight?: number;
};
