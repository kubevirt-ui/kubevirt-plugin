export enum OS_NAME_TYPES {
  rhel = 'rhel',
  fedora = 'fedora',
  centos = 'centos',
  windows = 'windows',
  other = 'other',
}

export enum FLAVORS {
  tiny = 'tiny',
  small = 'small',
  medium = 'medium',
  large = 'large',
}

export enum SUPPORT_TYPES {
  Full = 'Full',
  Limited = 'Limited',
}

export enum WORKLOADS {
  desktop = 'desktop',
  server = 'server',
  highperformance = 'highperformance',
}

export const WORKLOADS_LABELS = {
  [WORKLOADS.desktop]: 'Desktop',
  [WORKLOADS.server]: 'Server',
  [WORKLOADS.highperformance]: 'High performance',
};

export const OS_NAME_LABELS = {
  [OS_NAME_TYPES.rhel]: 'RHEL',
  [OS_NAME_TYPES.fedora]: 'Fedora',
  [OS_NAME_TYPES.centos]: 'CentOS',
  [OS_NAME_TYPES.windows]: 'Windows',
  [OS_NAME_TYPES.other]: 'Other',
};
