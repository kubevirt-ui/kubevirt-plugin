import { matchPath } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { getSingleClusterVMListURL } from '@kubevirt-utils/resources/vm/utils/urls';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { ResourceRouteHandler } from '@stolostron/multicluster-sdk';

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

  const baseVMListURL = `/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}`;
  return `${baseVMListURL}${cluster ? `?rowFilter-cluster=${cluster}` : ''}`;
};

export const getACMVMSearchURL = (): string =>
  `/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}/search`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string => {
  const vmListClusterURL = getACMVMListURL(cluster);

  return `${vmListClusterURL}${
    vmListClusterURL?.includes('?') ? '&' : '?'
  }rowFilter-project=${namespace}`;
};

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
  cluster ? getACMVMURL(cluster, namespace, name) : getSingleClusterVMListURL(namespace);

export const getVMListURL = (cluster?: string, namespace?: string) =>
  cluster ? getACMVMListURL(cluster, namespace) : getSingleClusterVMListURL(namespace);

export const getFleetResourceRoute: ResourceRouteHandler = ({
  cluster,
  model,
  name,
  namespace,
}) => {
  const { group, kind, version } = model;
  switch (kind) {
    case 'VirtualMachine':
      return `/k8s/cluster/${cluster}/ns/${namespace}/${group}~${version}~VirtualMachine/${name}`;
    case 'VirtualMachineClusterInstancetype':
      return `/k8s/cluster/${cluster}/${group}~${version}~${kind}/${name}`;
    case 'VirtualMachineInstancetype':
      return `/k8s/cluster/${cluster}/ns/${namespace}/${group}~${version}~${kind}/${name}`;
    default:
      return null;
  }
};
