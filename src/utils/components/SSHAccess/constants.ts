import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const PORT = 22000;
export const SSH_PORT = 22;

export const VMI_LABEL_AS_SSH_SERVICE_SELECTOR = 'kubevirt.io/domain';

export enum SERVICE_TYPES {
  LOAD_BALANCER = 'LoadBalancer',
  NODE_PORT = 'NodePort',
  NONE = 'None',
}

export const serviceTypeTitles = {
  [SERVICE_TYPES.LOAD_BALANCER]: t('SSH over LoadBalancer'),
  [SERVICE_TYPES.NODE_PORT]: t('SSH over NodePort'),
  [SERVICE_TYPES.NONE]: t('None'),
};
