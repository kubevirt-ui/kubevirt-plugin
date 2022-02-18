export const TEMPLATE_TYPE_LABEL = 'template.kubevirt.io/type';
export const TEMPLATE_DEFAULT_VARIANT_LABEL = 'template.kubevirt.io/default-os-variant';
export const TEMPLATE_TYPE_VM = 'vm';
export const TEMPLATE_TYPE_BASE = 'base';
export const TEMPLATE_FLAVOR_LABEL = 'flavor.template.kubevirt.io';
export const TEMPLATE_WORKLOAD_LABEL = 'workload.template.kubevirt.io';
export const TEMPLATE_SUPPORT_LEVEL_ANNOTATION = 'template.kubevirt.io/provider-support-level';
export const TEMPLATE_OS_TEMPLATE_ANNOTATION = 'vm.kubevirt.io/template';
export const TEMPLATE_OS_ANNOTATION = 'vm.kubevirt.io/os';
export const TEMPLATE_PROVIDER_NAME_ANNOTATION = 'openshift.io/provider-display-name';
export const TEMPLATE_DESCRIPTION_ANNOTATION = 'description';
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
