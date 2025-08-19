import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';

import { VirtualMachineModel } from '../views/dashboard-extensions/utils';

export const isACMPath = (pathname: string): boolean =>
  pathname.startsWith('/k8s/cluster') || pathname.startsWith('/k8s/all-clusters');

export const getACMVMURL = (cluster: string, namespace: string, name: string): string =>
  `/k8s/cluster/${cluster}/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}`;

export const getACMVMListURL = (cluster?: string): string =>
  cluster
    ? `/k8s/cluster/${cluster}/all-namespaces/kubevirt.io~v1~VirtualMachine`
    : `/k8s/all-clusters/all-namespaces/kubevirt.io~v1~VirtualMachine`;

export const getACMVMSearchURL = (): string =>
  `/k8s/all-clusters/all-namespaces/kubevirt.io~v1~VirtualMachine/search`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string =>
  `/k8s/cluster/${cluster}/ns/${namespace}/kubevirt.io~v1~VirtualMachine`;

export const getCatalogURL = (cluster: string, namespace?: string): string => {
  const namespacePath = namespace ? `ns/${namespace}` : ALL_NAMESPACES;

  return cluster
    ? `/k8s/cluster/${cluster}/${namespacePath}/catalog`
    : `/k8s/${namespacePath}/catalog`;
};

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
