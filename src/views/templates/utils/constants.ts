export const ANNOTATIONS = {
  displayName: 'openshift.io/display-name',
  providerDisplayName: 'openshift.io/provider-display-name',
  providerName: 'template.kubevirt.io/provider',
};

export const LABELS = {
  name: 'vm.kubevirt.io/template',
  namespace: 'vm.kubevirt.io/template.namespace',
  provider: 'template.kubevirt.io/provider',
  type: 'template.kubevirt.io/type',
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

// t('Can not edit in view-only mode')
export const NO_EDIT_TEMPLATE_PERMISSIONS = 'Can not edit in view-only mode';

// t('Can not delete in view-only mode')
export const NO_DELETE_TEMPLATE_PERMISSIONS = 'Can not delete in view-only mode';
