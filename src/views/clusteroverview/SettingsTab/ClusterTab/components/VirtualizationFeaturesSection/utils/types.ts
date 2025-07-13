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

export type OperatorsToInstall = Partial<Record<VirtualizationFeatureOperators, boolean>>;
