import { matchPath } from 'react-router-dom-v5-compat';

import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import {
  getSingleClusterVMListURL,
  getSingleClusterVMURL,
} from '@kubevirt-utils/resources/vm/utils/urls';
import {
  CLUSTER_LIST_FILTER_PARAM,
  PROJECT_LIST_FILTER_PARAM,
} from '@kubevirt-utils/utils/constants';
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
  return `${baseVMListURL}${cluster ? `?${CLUSTER_LIST_FILTER_PARAM}=${cluster}` : ''}`;
};

export const getACMVMSearchURL = (): string =>
  `/k8s/all-clusters/all-namespaces/${KUBEVIRT_VM_PATH}/search`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string => {
  const vmListClusterURL = getACMVMListURL(cluster);

  return `${vmListClusterURL}${
    vmListClusterURL?.includes('?') ? '&' : '?'
  }${PROJECT_LIST_FILTER_PARAM}=${namespace}`;
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
  cluster ? getACMVMURL(cluster, namespace, name) : getSingleClusterVMURL(namespace, name);

export const getVMListURL = (
  cluster?: string,
  namespace?: string,
  additionalFiltersSearch?: string,
) => {
  const baseURL = cluster
    ? getACMVMListURL(cluster, namespace)
    : getSingleClusterVMListURL(namespace);

  const additionalFiltersParams = new URLSearchParams(additionalFiltersSearch || '');

  additionalFiltersParams.delete(PROJECT_LIST_FILTER_PARAM);
  additionalFiltersParams.delete(CLUSTER_LIST_FILTER_PARAM);

  const sanitizedParams = additionalFiltersParams.toString();

  if (!sanitizedParams) return baseURL;

  const sepearator = baseURL.includes('?') ? '&' : '?';
  return `${baseURL}${sepearator}${sanitizedParams}`;
};

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
