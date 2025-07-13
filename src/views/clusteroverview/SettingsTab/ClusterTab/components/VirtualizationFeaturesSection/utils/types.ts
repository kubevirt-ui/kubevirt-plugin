import { VirtFeatureOperatorItem } from './hooks/useVirtualizationOperators/utils/types';

export type VirtualizationFeatureOperators =
  | 'cluster-kube-descheduler-operator'
  | 'fence-agents-remediation'
  | 'kubernetes-nmstate-operator'
  | 'netobserv-operator'
  | 'node-healthcheck-operator';

export enum InstallState {
  'FAILED' = 'failed',
  'INSTALLED' = 'installed',
  'INSTALLING' = 'installing',
  'NOT_INSTALLED' = 'notInstalled',
  'UNKNOWN' = 'unknown',
}

export type GroupedOperatorItems = {
  [key in VirtualizationFeatureOperators]: VirtFeatureOperatorItem[];
};

export type OperatorsToInstall = { [key in VirtualizationFeatureOperators]: boolean };

export type UpdateInstallRequest = (
  operatorName: VirtualizationFeatureOperators,
  newSwitchState: boolean,
) => void;
