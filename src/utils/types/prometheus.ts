import { PrometheusRule } from '@openshift-console/dynamic-plugin-sdk';

export type Group = {
  file: string;
  name: string;
  rules: PrometheusRule[];
};

export type PrometheusRulesResponse = {
  data: {
    groups?: Group[];
  };
  status: string;
};
