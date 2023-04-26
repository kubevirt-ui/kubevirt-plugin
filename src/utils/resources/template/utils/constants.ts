import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

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
export const TEMPLATE_APP_NAME_LABEL = 'app.kubernetes.io/name';
export const CUSTOM_TEMPLATES = 'custom-templates';

export const DATA_SOURCE_CRONJOB_LABEL = 'cdi.kubevirt.io/dataImportCron';

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

// t('Desktop')
// t('Server')
// t('High performance')
export const WORKLOADS_LABELS = {
  [WORKLOADS.desktop]: 'Desktop',
  [WORKLOADS.server]: 'Server',
  [WORKLOADS.highperformance]: 'High performance',
};

export const WORKLOADS_DESCRIPTIONS = {
  [WORKLOADS.desktop]: t('Small scale consumption, recommended for using the graphical console'),
  [WORKLOADS.server]: t('Balances performance, compatible with a broad range of workloads'),
  [WORKLOADS.highperformance]: t('Optimized for High resource consumption workloads'),
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
  {
    id: OS_NAME_TYPES.other,
    title: OS_NAME_LABELS.other,
  },
];

export enum BOOT_SOURCE {
  PVC = 'PVC',
  DATA_SOURCE = 'DATA_SOURCE',
  DATA_SOURCE_AUTO_IMPORT = 'DATA_SOURCE_AUTO_IMPORT',
  URL = 'URL',
  REGISTRY = 'REGISTRY',
  CONTAINER_DISK = 'CONTAINER_DISK',
  NONE = 'NONE',
}

// t('PVC')
// t('PVC (auto import)')
// t('URL')
// t('Registry')
// t('Container disk')
// t('No boot source')

export const BOOT_SOURCE_LABELS = {
  [BOOT_SOURCE.PVC]: 'PVC',
  [BOOT_SOURCE.DATA_SOURCE]: 'PVC',
  [BOOT_SOURCE.DATA_SOURCE_AUTO_IMPORT]: 'PVC (auto import)',
  [BOOT_SOURCE.URL]: 'URL',
  [BOOT_SOURCE.REGISTRY]: 'Registry',
  [BOOT_SOURCE.CONTAINER_DISK]: 'Container disk',
  [BOOT_SOURCE.NONE]: 'No boot source',
};

export const OS_IMAGE_LINKS = {
  [OS_NAME_TYPES.rhel]: 'https://access.redhat.com/downloads/content/479/ver=/rhel---8/',
  [OS_NAME_TYPES.fedora]: 'https://alt.fedoraproject.org/cloud/',
  [OS_NAME_TYPES.centos]: 'https://cloud.centos.org/centos/',
  [OS_NAME_TYPES.windows]: 'https://www.microsoft.com/en-us/software-download/windows10ISO',
  [OS_NAME_TYPES.other]: 'https://alt.fedoraproject.org/cloud/',
};

export const GENERATE_VM_PRETTY_NAME_ANNOTATION =
  'openshift.kubevirt.io/pronounceable-suffix-for-name-expression';
