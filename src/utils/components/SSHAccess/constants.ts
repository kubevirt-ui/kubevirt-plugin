export const PORT = 22000;
export const SSH_PORT = 22;

export const VMI_LABEL_AS_SSH_SERVICE_SELECTOR = 'kubevirt.io/domain';

export const NODE_PORTS_LINK =
  'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.14/html/networking/configuring-ingress-cluster-traffic#nw-using-nodeport_configuring-ingress-cluster-traffic-nodeport';

export enum SERVICE_TYPES {
  LOAD_BALANCER = 'LoadBalancer',
  NODE_PORT = 'NodePort',
  NONE = 'None',
}

export const exampleIdentityFilePath = '--identity-file=/home/jdoe/.ssh/id_rsa';
