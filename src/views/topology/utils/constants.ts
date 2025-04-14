export const TYPE_VIRTUAL_MACHINE = 'virtual-machine';

export const WORKLOAD_TYPES = [
  'deployments',
  'deploymentConfigs',
  'daemonSets',
  'statefulSets',
  'jobs',
  'cronJobs',
  'pods',
];

export const DEFAULT_NODE_PAD = 20;

export const NODE_WIDTH = 104;
export const NODE_HEIGHT = 104;
export const NODE_PADDING = [0, DEFAULT_NODE_PAD];

export enum VMIPhase {
  Failed = 'Failed',
  Pending = 'Pending',
  Running = 'Running',
  Scheduled = 'Scheduled',
  Scheduling = 'Scheduling',
  Succeeded = 'Succeeded',
  Unknown = 'Unknown',
}
