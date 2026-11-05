export const KUBEVIRT = 'kubevirt';

export const DEFAULT_NAMESPACE = 'default';
export const OPENSHIFT_NAMESPACE = 'openshift';
export const KUBEVIRT_OS_IMAGES_NS = 'kubevirt-os-images';
export const OPENSHIFT_OS_IMAGES_NS = 'openshift-virtualization-os-images';
export const OPENSHIFT_SRIOV_NETWORK_OPERATOR_NS = 'openshift-sriov-network-operator';
export const OPENSHIFT_MULTUS_NS = 'openshift-multus';

/** Prefer runStrategy over deprecated VM spec.running (CNV-45435). */
export const RUNSTRATEGY_ALWAYS = 'Always';
export const RUNSTRATEGY_HALTED = 'Halted';
export const RUNSTRATEGY_RERUNONFAILURE = 'RerunOnFailure';
