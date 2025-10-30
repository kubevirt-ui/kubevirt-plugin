import { matchPath } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { ResourceRouteHandler } from '@stolostron/multicluster-sdk';

import { VirtualMachineModel } from '../views/dashboard-extensions/utils';

import { KUBEVIRT_VM_PATH } from './constants';

export const isACMPath = (pathname: string): boolean => {
  if (pathname.startsWith('/k8s/all-clusters')) return true;

  const clusterMatch = matchPath('/k8s/cluster/:cluster/*', pathname);

  return clusterMatch !== null && !clusterMatch?.params?.cluster?.includes('~');
};

export const getACMVMURL = (cluster: string, namespace: string, name: string): string =>
  `/k8s/cluster/${cluster}/ns/${namespace}/${KUBEVIRT_VM_PATH}/${name}`;

export const getACMVMListURL = (cluster?: string, namespace?: string): string => {
  if (namespace) return getACMVMListNamespacesURL(cluster, namespace);

  return cluster
    ? `/k8s/cluster/${cluster}/all-namespaces/${KUBEVIRT_VM_PATH}`
    : `/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}`;
};

export const getACMVMSearchURL = (): string =>
  `/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}/search`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string =>
  `/k8s/cluster/${cluster}/ns/${namespace}/${KUBEVIRT_VM_PATH}`;

export const getCatalogURL = (cluster: string, namespace?: string): string => {
  const namespacePath = isAllNamespaces(namespace) ? ALL_NAMESPACES : `ns/${namespace}`;

  return cluster
    ? `/k8s/cluster/${cluster}/${namespacePath}/catalog`
    : `/k8s/${namespacePath}/catalog`;
};

export const getConsoleStandaloneURL = (
  namespace: string,
  name: string,
  cluster?: string,
): string => {
  const commonPath = `/ns/${namespace}/${KUBEVIRT_VM_PATH}/${name}/console/standalone`;
  const clusterPath = cluster ? `/cluster/${cluster}` : '';
  return `/k8s${clusterPath}${commonPath}`;
};

export const getVMURL = (cluster: string, namespace: string, name: string): string =>
  cluster
    ? getACMVMURL(cluster, namespace, name)
    : getResourceUrl({
        activeNamespace: namespace,
        model: VirtualMachineModel,
        resource: { metadata: { name, namespace } },
      });

export const getVMListURL = (cluster?: string, namespace?: string) =>
  cluster
    ? getACMVMListURL(cluster, namespace)
    : getResourceUrl({
        activeNamespace: namespace,
        model: VirtualMachineModel,
      });

export const getVMListNamespacesURL = (cluster: string, namespace: string): string =>
  cluster
    ? getACMVMListNamespacesURL(cluster, namespace)
    : getResourceUrl({
        activeNamespace: namespace,
        model: VirtualMachineModel,
      });

export const getFleetNamespacedResourceRoute: ResourceRouteHandler = ({
  cluster,
  model,
  name,
  namespace,
}) => {
  const { group, kind, version } = model;
  return `/k8s/cluster/${cluster}/ns/${namespace}/${group}~${version}~${kind}/${name}`;
};

export const getFleetClusterwideResourceRoute: ResourceRouteHandler = ({
  cluster,
  model,
  name,
}) => {
  const { group, kind, version } = model;
  return `/k8s/cluster/${cluster}/${group}~${version}~${kind}/${name}`;
};
