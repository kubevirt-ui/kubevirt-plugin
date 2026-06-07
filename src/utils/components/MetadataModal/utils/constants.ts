export const SYSTEM_LABEL_PREFIXES = [
  'kubevirt.io/',
  'vm.kubevirt.io/',
  'vmi.kubevirt.io/',
  'template.kubevirt.io/',
  'os.template.kubevirt.io/',
  'flavor.template.kubevirt.io/',
  'workload.template.kubevirt.io/',
  'instancetype.kubevirt.io/',
  'cdi.kubevirt.io/',
  'vm.openshift.io/',
  'app.kubernetes.io/',
  'kubernetes.io/',
  'network.kubevirt.io/',
  'storageclass.kubevirt.io/',
  'node-role.kubernetes.io/',
  'pod-security.kubernetes.io/',
  'snapshot.kubevirt.io/',
  'export.kubevirt.io/',
  'upload.cdi.kubevirt.io/',
  'open-cluster-management.io/',
  'cluster.open-cluster-management.io/',
];

export const SYSTEM_ANNOTATION_PREFIXES = [
  ...SYSTEM_LABEL_PREFIXES,
  'kubectl.kubernetes.io/',
  'kubemacpool.io/',
  'name.os.template.kubevirt.io/',
  'storageclass.kubernetes.io/',
  'openshift.io/',
  'console.openshift.io/',
  'openshift.kubevirt.io/',
  'kubevirt.kubevirt.io/',
  'hco.kubevirt.io/',
  'operator-sdk/',
  'dataimportcrontemplate.kubevirt.io/',
];

// i18next-parser cannot extract interpolated strings from t() calls where
// the options object references variables. These comments ensure extraction:
// t('Cannot use system-managed key: {{key}}')
// t("Create \"{{key}}\"")
// t('Failed to remove {{key}}: {{error}}')
// t('Remove {{key}}')
// t('Search for {{key}}={{value}}')

export const CURATED_LABEL_KEYS = [
  'Application',
  'Department',
  'Environment',
  'Location',
  'Owner',
  'Purpose',
];
