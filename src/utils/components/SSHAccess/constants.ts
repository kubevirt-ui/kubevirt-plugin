export const PORT = 22000;
export const SSH_PORT = 22;

export const VM_LABEL_AS_SSH_SERVICE_SELECTOR = 'vm.kubevirt.io/name';

export enum SERVICE_TYPES {
  LOAD_BALANCER = 'LoadBalancer',
  NODE_PORT = 'NodePort',
  NONE = 'None',
}

export const serviceTypeTitles = {
  [SERVICE_TYPES.LOAD_BALANCER]: 'SSH over LoadBalancer',
  [SERVICE_TYPES.NODE_PORT]: 'SSH over NodePort',
  [SERVICE_TYPES.NONE]: 'None',
};
