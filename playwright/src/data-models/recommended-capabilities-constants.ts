/**
 * Capability IDs and titles for the Recommended capabilities Settings tab.
 * IDs match `capabilityFeatures.ts` in product code.
 */

export const AUTO_CAPABILITY_IDS = [
  'load-balancing',
  'migrate-vms',
  'virtualization-dashboards',
] as const;

export const AUTO_CAPABILITY_TITLES = [
  'Load balancing',
  'Migrate VMs',
  'Virtualization dashboards',
] as const;

export const MANUAL_CAPABILITY_IDS = [
  'backup-and-recovery',
  'hardware-aware-scheduling',
  'high-availability',
  'host-network-management',
  'isolated-workloads',
  'manage-clusters-from-hub',
  'numa-aware-scheduling',
  'storage-on-local-disks',
] as const;

export const MANUAL_CAPABILITY_TITLES = [
  'Backup and recovery',
  'Hardware-aware scheduling',
  'High availability',
  'Host network management',
  'Isolated workloads (Kata)',
  'Manage clusters from a hub',
  'NUMA-aware scheduling',
  'Storage on local disks',
] as const;

export const PREFERRED_INSTALL_CAPABILITY_ID = 'migrate-vms';

export const LOAD_BALANCING_OPERATORS = [
  { displayName: 'Descheduler', packageName: 'cluster-kube-descheduler-operator' },
  { displayName: 'MetalLB', packageName: 'metallb-operator' },
] as const;

export const AUTO_CAPABILITY_OPERATORS: Record<string, readonly string[]> = {
  'load-balancing': ['cluster-kube-descheduler-operator', 'metallb-operator'],
  'migrate-vms': ['mtv-operator'],
  'virtualization-dashboards': [
    'cluster-observability-operator',
    'loki-operator',
    'cluster-logging',
  ],
};

export const HIGH_AVAILABILITY_OPERATORS = [
  { displayName: 'Node health check', packageName: 'node-healthcheck-operator' },
  { displayName: 'Fence agents remediation', packageName: 'fence-agents-remediation' },
  { displayName: 'Node maintenance', packageName: 'node-maintenance-operator' },
] as const;

export const AUTOPILOT_PACKAGE_NAMES = [
  'cluster-kube-descheduler-operator',
  'metallb-operator',
  'mtv-operator',
  'cluster-observability-operator',
  'loki-operator',
  'cluster-logging',
] as const;

export const CAPABILITY_STATUS = {
  INSTALLED: 'Installed',
  NOT_INSTALLED: 'Not installed',
  PARTIALLY_INSTALLED: 'Partially installed',
  INSTALLING: 'Installing',
} as const;

export const CONFIGURATION_STATUS = {
  MANUAL: 'Manual',
  NONE: '-',
  RECOMMENDED: 'Recommended',
} as const;
