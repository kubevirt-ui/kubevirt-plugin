import { FLEET_BASE_PATH } from '@multicluster/constants';

import { CHECKUP_URLS } from '../../../views/checkups/utils/constants';

export const getStorageCheckupURL = (name: string, namespace: string, cluster?: string) => {
  return cluster
    ? `${FLEET_BASE_PATH}/cluster/${cluster}/ns/${namespace}/checkups/${CHECKUP_URLS.STORAGE}/${name}`
    : `/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.STORAGE}/${name}`;
};

export const getSelfValidationCheckupURL = (name: string, namespace: string, cluster?: string) => {
  return cluster
    ? `${FLEET_BASE_PATH}/cluster/${cluster}/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}/${name}`
    : `/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}/${name}`;
};
