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

export const CURATED_LABEL_KEYS = [
  'Application',
  'Department',
  'Environment',
  'Location',
  'Owner',
  'Purpose',
];

export const K8S_LABEL_SEGMENT_MAX = 63;
export const K8S_DNS_SUBDOMAIN_MAX = 253;

export const HINT_VALUE = '__hint__';
export const CREATE_VALUE = '__create__';
export const NO_RESULTS_VALUE = '__no_results__';

export const LABEL_KEY_REGEX =
  /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?[A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?$/;
export const LABEL_VALUE_REGEX = /^([A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?)?$/;
