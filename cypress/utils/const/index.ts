export const KUBEADMIN_USERNAME = 'kubeadmin';
export const KUBEADMIN_IDP = 'kube:admin';

export enum CLUSTER_STATUS {
  READY = 'Ready',
  PROGRESSING = 'Progressing',
  HEALTH_ERROR = 'HEALTH_ERR',
}

export const adminOnlyDescribe = Cypress.env('NON_PRIV') ? xdescribe : describe;

export const TEST_NS = 'auto-test-ns';

// VM Status
export enum VM_STATUS {
  Starting = 'Starting',
  Running = 'Running',
  Stopped = 'Stopped',
  Provisioning = 'Provisioning',
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
