export const KUBEADMIN_USERNAME = 'kubeadmin';
export const KUBEADMIN_IDP = 'kube:admin';

export enum CLUSTER_STATUS {
  READY = 'Ready',
  PROGRESSING = 'Progressing',
  HEALTH_ERROR = 'HEALTH_ERR',
}

export const adminOnlyDescribe = Cypress.env('NON_PRIV') ? xdescribe : describe;
