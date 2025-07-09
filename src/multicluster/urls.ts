import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { getResourceUrl } from '@kubevirt-utils/resources/shared';

import { BASE_ACM_VM_PATH } from './constants';

export const getACMVMURL = (cluster: string, namespace: string, name: string): string =>
  `${BASE_ACM_VM_PATH}/${cluster}/${namespace}/${name}`;

export const getACMVMListURL = (cluster: string): string => `${BASE_ACM_VM_PATH}/${cluster}`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string =>
  `${BASE_ACM_VM_PATH}/${cluster}/${namespace}`;

export const getVMURL = (cluster: string, namespace: string, name: string): string =>
  cluster
    ? getACMVMURL(cluster, namespace, name)
    : getResourceUrl({
        activeNamespace: namespace,
        model: VirtualMachineModel,
        resource: { metadata: { name, namespace } },
      });

export const getVMListURL = (cluster: string) =>
  cluster
    ? getACMVMListURL(cluster)
    : getResourceUrl({
        model: VirtualMachineModel,
      });

export const getVMListNamespacesURL = (cluster: string, namespace: string): string =>
  cluster
    ? getACMVMListNamespacesURL(cluster, namespace)
    : getResourceUrl({
        activeNamespace: namespace,
        model: VirtualMachineModel,
      });
