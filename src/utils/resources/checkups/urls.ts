import { CHECKUP_URLS } from '../../../views/checkups/utils/constants';

export const getStorageCheckupURL = (name: string, namespace: string, cluster?: string) => {
  return cluster
    ? `/k8s/cluster/${cluster}/ns/${namespace}/checkups/${CHECKUP_URLS.STORAGE}/${name}`
    : `/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.STORAGE}/${name}`;
};

export const getSelfValidationCheckupURL = (name: string, namespace: string, cluster?: string) => {
  return cluster
    ? `/k8s/cluster/${cluster}/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}/${name}`
    : `/k8s/ns/${namespace}/checkups/${CHECKUP_URLS.SELF_VALIDATION}/${name}`;
};
