import { documentationURL } from '@kubevirt-utils/constants/documentation';

export const TEMPLATE_TYPE_LABEL = 'template.kubevirt.io/type';
export const TEMPLATE_DEFAULT_VARIANT_LABEL = 'template.kubevirt.io/default-os-variant';
export const TEMPLATE_TYPE_VM = 'vm';
export const TEMPLATE_TYPE_BASE = 'base';
export const TEMPLATE_FLAVOR_LABEL = 'flavor.template.kubevirt.io';
export const TEMPLATE_WORKLOAD_LABEL = 'workload.template.kubevirt.io';
export const TEMPLATE_BASE_IMAGE_NAME_PARAMETER = 'SRC_PVC_NAME';
export const TEMPLATE_BASE_IMAGE_NAMESPACE_PARAMETER = 'SRC_PVC_NAMESPACE';
export const TEMPLATE_VM_COMMON_NAMESPACE = 'openshift';
export const TEMPLATE_DATA_SOURCE_NAME_PARAMETER = 'DATA_SOURCE_NAME';
export const TEMPLATE_DATA_SOURCE_NAMESPACE_PARAMETER = 'DATA_SOURCE_NAMESPACE';
export const LABEL_USED_TEMPLATE_NAME = 'vm.kubevirt.io/template';
export const LABEL_USED_TEMPLATE_NAMESPACE = 'vm.kubevirt.io/template.namespace';
export const TEMPLATE_VERSION_LABEL = 'vm.kubevirt.io/template.version';
export const TEMPLATE_CATEGORY_LABEL = 'vm.kubevirt.io/category';
export const APP_NAME_LABEL = 'app.kubernetes.io/name';
export const CUSTOM_TEMPLATES = 'custom-templates';

/** Default category options for `vm.kubevirt.io/category`. */
export const DEFAULT_TEMPLATE_CATEGORIES = [
  'Databases',
  'Operating-systems',
  'Monitoring',
  'Networking',
  'Observability',
  'Security',
  'Storage',
] as const;

export const DATA_SOURCE_CRONJOB_LABEL = 'cdi.kubevirt.io/dataImportCron';

export const LINUX = 'linux';
export const RHEL = 'rhel';
export const WINDOWS = 'windows';

export enum OS_NAME_TYPES_NOT_SUPPORTED {
  Debian = 'debian',
  Ubuntu = 'ubuntu',
}

export enum OS_NAME_TYPES {
  Centos = 'centos',
  Fedora = 'fedora',
  Other = 'other',
  Rhel = 'rhel',
  Windows = 'windows',
}

export enum FLAVORS {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  Tiny = 'tiny',
}

export enum SUPPORT_TYPES {
  Full = 'Full',
  Limited = 'Limited',
}

export enum WORKLOADS {
  Desktop = 'desktop',
  HighPerformance = 'highperformance',
  Server = 'server',
}

export const WORKLOADS_LABELS = {
  [WORKLOADS.Desktop]: 'Desktop',
  [WORKLOADS.HighPerformance]: 'High performance',
  [WORKLOADS.Server]: 'Server',
};

export const WORKLOADS_DESCRIPTIONS = {
  [WORKLOADS.Desktop]: 'Small scale consumption, recommended for using the graphical console',
  [WORKLOADS.HighPerformance]: 'Optimized for high resource consumption workloads',
  [WORKLOADS.Server]: 'Balances performance, compatible with a broad range of workloads',
};

export const OS_NAME_LABELS = {
  [OS_NAME_TYPES.Centos]: 'CentOS',
  [OS_NAME_TYPES.Fedora]: 'Fedora',
  [OS_NAME_TYPES.Other]: 'Other',
  [OS_NAME_TYPES.Rhel]: 'RHEL',
  [OS_NAME_TYPES.Windows]: 'Windows',
};

export const OS_NAMES = [
  {
    id: OS_NAME_TYPES.Rhel,
    title: OS_NAME_LABELS.rhel,
  },
  {
    id: OS_NAME_TYPES.Fedora,
    title: OS_NAME_LABELS.fedora,
  },
  {
    id: OS_NAME_TYPES.Centos,
    title: OS_NAME_LABELS.centos,
  },
  {
    id: OS_NAME_TYPES.Windows,
    title: OS_NAME_LABELS.windows,
  },
  {
    id: OS_NAME_TYPES.Other,
    title: OS_NAME_LABELS.other,
  },
];

export const WORKLOAD_ITEMS = [
  { id: WORKLOADS.Desktop, title: WORKLOADS_LABELS.desktop },
  { id: WORKLOADS.HighPerformance, title: WORKLOADS_LABELS.highperformance },
  { id: WORKLOADS.Server, title: WORKLOADS_LABELS.server },
];

export enum BOOT_SOURCE {
  CONTAINER_DISK = 'CONTAINER_DISK',
  DATA_SOURCE = 'DATA_SOURCE',
  DATA_SOURCE_AUTO_IMPORT = 'DATA_SOURCE_AUTO_IMPORT',
  NONE = 'NONE',
  PVC = 'PVC',
  REGISTRY = 'REGISTRY',
  SNAPSHOT = 'SNAPSHOT',
  URL = 'URL',
}

export const BOOT_SOURCE_LABELS = {
  [BOOT_SOURCE.CONTAINER_DISK]: 'Container disk',
  [BOOT_SOURCE.DATA_SOURCE]: 'PVC',
  [BOOT_SOURCE.DATA_SOURCE_AUTO_IMPORT]: 'PVC (auto import)',
  [BOOT_SOURCE.NONE]: 'No boot source',
  [BOOT_SOURCE.PVC]: 'PVC',
  [BOOT_SOURCE.REGISTRY]: 'Registry',
  [BOOT_SOURCE.SNAPSHOT]: 'Snapshot',
  [BOOT_SOURCE.URL]: 'URL',
};

export const OS_IMAGE_LINKS = {
  [OS_NAME_TYPES.Centos]: documentationURL.OS_IMAGE_CENTOS,
  [OS_NAME_TYPES.Fedora]: documentationURL.OS_IMAGE_FEDORA,
  [OS_NAME_TYPES.Other]: documentationURL.OS_IMAGE_OTHER,
  [OS_NAME_TYPES.Rhel]: documentationURL.OS_IMAGE_RHEL,
  [OS_NAME_TYPES.Windows]: documentationURL.OS_IMAGE_WINDOWS,
};

export const GENERATE_VM_PRETTY_NAME_ANNOTATION =
  'openshift.kubevirt.io/pronounceable-suffix-for-name-expression';

export const HIDE_DEPRECATED_TEMPLATES = 'hideDeprecatedTemplates';
export const HIDE_DEPRECATED_TEMPLATES_KEY = 'hide-deprecated-templates';

export const NAME_PARAMETER = 'NAME';
