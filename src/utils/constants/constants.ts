export const KUBEVIRT = 'kubevirt';

export const DEFAULT_NAMESPACE = 'default';
export const OPENSHIFT_NAMESPACE = 'openshift';
export const KUBEVIRT_OS_IMAGES_NS = 'kubevirt-os-images';
export const OPENSHIFT_OS_IMAGES_NS = 'openshift-virtualization-os-images';
export const OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS = 'openshift-sriov-network-operator';
export const OPENSHIFT_MULTUS_NS = 'openshift-multus';

export const VENDOR_LABEL = 'instancetype.kubevirt.io/vendor';

export const ROOTDISK = 'rootdisk';

export const KUBEVIRT_HYPERCONVERGED = 'kubevirt-hyperconverged';
export const OPENSHIFT_CNV = 'openshift-cnv';

export enum K8S_OPS {
  ADD = 'add',
  REMOVE = 'remove',
  REPLACE = 'replace',
}
