export const KUBEADMIN_USERNAME = 'kubeadmin';
export const KUBEADMIN_IDP = 'kube:admin';

export enum CLUSTER_STATUS {
  HEALTH_ERROR = 'HEALTH_ERR',
  PROGRESSING = 'Progressing',
  READY = 'Ready',
}

export const adminOnlyDescribe = Cypress.env('NON_PRIV') ? xdescribe : describe;

export const TEST_NS = 'auto-test-ns';

export enum VM_STATUS {
  Provisioning = 'Provisioning',
  Running = 'Running',
  Starting = 'Starting',
  Stopped = 'Stopped',
}

export enum ACTION_TIMEOUT {
  BOOTUP = 60000,
  IMPORT = 300000,
}

export enum K8S_KIND {
  DV = 'DataVolume',
  NAD = 'net-attach-def',
  PVC = 'PersistentVolumeClaim',
  TEMPLATE = 'Template',
  VM = 'VirtualMachine',
  VMI = 'VirtualMachineInstance',
}
