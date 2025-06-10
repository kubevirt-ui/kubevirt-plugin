import { BASE_ACM_VM_PATH } from './constants';

export const getACMVMUrl = (cluster: string, namespace: string, name: string): string =>
  `${BASE_ACM_VM_PATH}/${cluster}/${namespace}/${name}`;
export const getACMVMListUrl = (cluster: string): string => `${BASE_ACM_VM_PATH}/${cluster}`;

export const getACMVMListNamespacesUrl = (cluster: string, namespace: string): string =>
  `${BASE_ACM_VM_PATH}/${cluster}/${namespace}`;
