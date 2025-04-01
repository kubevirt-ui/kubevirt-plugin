import { TaintEffect } from '@openshift-console/dynamic-plugin-sdk';

export type TolerationOperator = 'Equal' | 'Exists';

export type Toleration = {
  effect: TaintEffect;
  key?: string;
  operator: TolerationOperator;
  tolerationSeconds?: number;
  value?: string;
};
