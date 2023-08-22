export const PORT = 22000;
export const SSH_PORT = 22;

export const VMI_LABEL_AS_SSH_SERVICE_SELECTOR = 'kubevirt.io/domain';

export enum SERVICE_TYPES {
  LOAD_BALANCER = 'LoadBalancer',
  NONE = 'None',
}

export const METALLB_GROUP = 'metallb.io';

export const exampleIdentityFilePath = '--identity-file=/home/jdoe/.ssh/id_rsa';
