export const TEMPLATE_TYPE_LABEL = 'template.kubevirt.io/type';
export const TEMPLATE_DEFAULT_VARIANT_LABEL = 'template.kubevirt.io/default-os-variant';
export const TEMPLATE_TYPE_VM = 'vm';
export const TEMPLATE_TYPE_BASE = 'base';
export const TEMPLATE_FLAVOR_LABEL = 'flavor.template.kubevirt.io';
export const TEMPLATE_WORKLOAD_LABEL = 'workload.template.kubevirt.io';
export const TEMPLATE_BASE_IMAGE_NAME_PARAMETER = 'SRC_PVC_NAME';
export const TEMPLATE_BASE_IMAGE_NAMESPACE_PARAMETER = 'SRC_PVC_NAMESPACE';
export const TEMPLATE_DATA_SOURCE_NAME_PARAMETER = 'DATA_SOURCE_NAME';
export const TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER = 'DATA_SOURCE_NAMESPACE';

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

export const OS_NAMES = [
  {
    id: OS_NAME_TYPES.rhel,
    title: OS_NAME_LABELS.rhel,
  },
  {
    id: OS_NAME_TYPES.fedora,
    title: OS_NAME_LABELS.fedora,
  },
  {
    id: OS_NAME_TYPES.centos,
    title: OS_NAME_LABELS.centos,
  },
  {
    id: OS_NAME_TYPES.windows,
    title: OS_NAME_LABELS.windows,
  },
];

export enum BOOT_SOURCE {
  PVC = 'PVC',
  PVC_AUTO_UPLOAD = 'PVC_AUTO_UPLOAD',
  URL = 'URL',
  REGISTRY = 'REGISTRY',
}

export const BOOT_SOURCE_LABELS = {
  [BOOT_SOURCE.PVC]: 'PVC',
  [BOOT_SOURCE.PVC_AUTO_UPLOAD]: 'PVC (auto upload)',
  [BOOT_SOURCE.URL]: 'URL',
  [BOOT_SOURCE.REGISTRY]: 'Registry',
};

export const OS_IMAGE_LINKS = {
  [OS_NAME_TYPES.rhel]: 'https://access.redhat.com/downloads/content/479/ver=/rhel---8/',
  [OS_NAME_TYPES.fedora]: 'https://alt.fedoraproject.org/cloud/',
  [OS_NAME_TYPES.centos]: 'https://cloud.centos.org/centos/',
  [OS_NAME_TYPES.windows]: 'https://www.microsoft.com/en-us/software-download/windows10ISO',
  [OS_NAME_TYPES.other]: 'https://alt.fedoraproject.org/cloud/',
};
