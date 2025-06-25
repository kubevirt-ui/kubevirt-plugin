import { BASE_ACM_VM_PATH } from './constants';

export const getACMVMURL = (cluster: string, namespace: string, name: string): string =>
  `${BASE_ACM_VM_PATH}/${cluster}/${namespace}/${name}`;
export const getACMVMListURL = (cluster: string): string => `${BASE_ACM_VM_PATH}/${cluster}`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string =>
  `${BASE_ACM_VM_PATH}/${cluster}/${namespace}`;
