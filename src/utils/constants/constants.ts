export const KUBEVIRT = 'kubevirt';

export const DEFAULT_NAMESPACE = 'default';
export const OPENSHIFT_NAMESPACE = 'openshift';
export const KUBEVIRT_OS_IMAGES_NS = 'kubevirt-os-images';
export const OPENSHIFT_OS_IMAGES_NS = 'openshift-virtualization-os-images';

export const OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS = 'openshift-sriov-network-operator';
export const OPENSHIFT_MULTUS_NS = 'openshift-multus';

export const VENDOR_LABEL = 'instancetype.kubevirt.io/vendor';

export const ROOTDISK = 'rootdisk';
export const CLOUDINITDISK = 'cloudinitdisk';

export const KUBEVIRT_HYPERCONVERGED = 'kubevirt-hyperconverged';
export const OPENSHIFT_CNV = 'openshift-cnv';

export const RUNSTRATEGY_ALWAYS = 'Always';
export const RUNSTRATEGY_HALTED = 'Halted';
export const RUNSTRATEGY_MANUAL = 'Manual';
export const RUNSTRATEGY_RERUNONFAILURE = 'RerunOnFailure';

export const SPACE_SYMBOL = ' ';

export enum K8S_OPS {
  ADD = 'add',
  REMOVE = 'remove',
  REPLACE = 'replace',
}

export enum PERSPECTIVES {
  ACM = 'acm',
  ADMIN = 'admin',
  DEVELOPER = 'dev',
  VIRTUALIZATION = 'virtualization-perspective',
}

export enum ARCHITECTURES {
  AMD64 = 'amd64',
  ARM64 = 'arm64',
  S390X = 's390x',
}
