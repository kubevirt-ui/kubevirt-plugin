export const SYSTEM_LABEL_PREFIXES = [
  'app.kubernetes.io/',
  'k8s.io/',
  'kubevirt.io/',
  'kubernetes.io/',
  'node.kubernetes.io/',
  'pod-security.kubernetes.io/',
  'vm.kubevirt.io/',
];

export const K8S_LABEL_NAME_REGEX = /^[A-Za-z0-9](?:[-A-Za-z0-9_.]*[A-Za-z0-9])?$/;

export const K8S_LABEL_PREFIX_REGEX =
  /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export const MAX_LABEL_LENGTH = 63;
export const MAX_LABEL_PREFIX_LENGTH = 253;
