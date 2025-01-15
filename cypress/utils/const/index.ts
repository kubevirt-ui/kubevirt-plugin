export const KUBEADMIN_USERNAME = 'kubeadmin';
export const KUBEADMIN_IDP = 'kube:admin';
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export enum CLUSTER_STATUS {
  HEALTH_ERROR = 'HEALTH_ERR',
  PROGRESSING = 'Progressing',
  READY = 'Ready',
}

export const adminOnlyDescribe = Cypress.env('NON_PRIV') ? xdescribe : describe;

export const TEST_NS = 'auto-test-ns';
export const QUICK_VM_IT_NAME = 'vm-it-quick';
export const CUST_VM_IT_NAME = 'vm-it-cust';

export enum VM_STATUS {
  DataVolumeError = 'DataVolumeError',
  Migrating = 'Migrating',
  Paused = 'Paused',
  Provisioning = 'Provisioning',
  Running = 'Running',
  Starting = 'Starting',
  Stopped = 'Stopped',
  Stopping = 'Stopping',
}

export enum ACTION_TIMEOUT {
  IMPORT = 900000,
  MIGRATE = 180000,
  START = 60000,
  STOP = 600000,
}

export enum K8S_KIND {
  DV = 'DataVolume',
  NAD = 'net-attach-def',
  PVC = 'PersistentVolumeClaim',
  TEMPLATE = 'Template',
  VM = 'VirtualMachine',
  VMI = 'VirtualMachineInstance',
}
