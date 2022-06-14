export const ANNOTATIONS = {
  displayName: 'openshift.io/display-name',
  providerName: 'template.kubevirt.io/provider',
  providerDisplayName: 'openshift.io/provider-display-name',
};

export const DESCHEDULER_URL =
  'https://kubevirt.io/user-guide/operations/node_assignment/#node-balancing-with-descheduler';

export const LABELS = {
  labelName: 'vm.kubevirt.io/template',
  labelNamespace: 'vm.kubevirt.io/template.namespace',
};

export const SOURCE_TYPES = {
  defaultSource: 'default',
  httpSource: 'http',
  pvcSource: 'pvc-clone',
  registrySource: 'registry',
  uploadSource: 'upload',
};

export type SOURCE_OPTIONS_IDS =
  | typeof SOURCE_TYPES.httpSource
  | typeof SOURCE_TYPES.pvcSource
  | typeof SOURCE_TYPES.registrySource
  | typeof SOURCE_TYPES.uploadSource;

export const SUPPORT_URL = 'https://access.redhat.com/articles/4234591';

// t('Desktop')
// t('Server')
// t('High performance')

export const workloadProfiles = {
  desktop: 'Desktop',
  server: 'Server',
  highperformance: 'High performance',
};

export type WorkloadProfileKeys = 'desktop' | 'server' | 'highperformance';
