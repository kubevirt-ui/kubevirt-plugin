import { matchPath } from 'react-router-dom-v5-compat';

import {
  ALL_CLUSTERS_KEY,
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY,
} from '@kubevirt-utils/hooks/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import { ExtensionK8sModel, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
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
  if (namespace && namespace !== ALL_NAMESPACES_SESSION_KEY) {
    if (!cluster || cluster === ALL_CLUSTERS_KEY) {
      return `/k8s/${ALL_CLUSTERS_KEY}/ns/${namespace}/${KUBEVIRT_VM_PATH}`;
    }
    return getACMVMListNamespacesURL(cluster, namespace);
  }

  return cluster && cluster !== ALL_CLUSTERS_KEY
    ? `/k8s/cluster/${cluster}/${ALL_NAMESPACES}/${KUBEVIRT_VM_PATH}`
    : `/k8s/${ALL_CLUSTERS_KEY}/${ALL_NAMESPACES}/${KUBEVIRT_VM_PATH}`;
};

export const getACMVMSearchURL = (): string =>
  `/k8s/${ALL_CLUSTERS_KEY}/${ALL_NAMESPACES}/${KUBEVIRT_VM_PATH}/search`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string =>
  `/k8s/cluster/${cluster}/ns/${namespace}/${KUBEVIRT_VM_PATH}`;

// based on dns1123LabelRegexp
const catalogWithNs = new RegExp('/ns/[-a-z0-9]+/catalog');

export const isCatalogURL = (path: string = ''): boolean =>
  path.includes(`${ALL_NAMESPACES}/catalog`) || catalogWithNs.test(path);

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

export const getVMListURL = (cluster?: string, namespace?: string): string =>
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

export const getMulticlusterSearchURL = (
  model: K8sModel,
  name: string,
  namespace: string,
  cluster: string,
): string => {
  const urlSearch = new URLSearchParams();
  urlSearch.set('cluster', cluster);
  urlSearch.set('kind', model.kind);
  urlSearch.set('apiversion', `${model.apiGroup || 'core'}/${model.apiVersion}`);
  urlSearch.set('namespace', namespace);
  urlSearch.set('name', name);
  return `/multicloud/search/resources?${urlSearch.toString()}`;
};

export type GetFleetResourceRouteProps = (input: {
  cluster: string;
  model: K8sModel;
  name: string;
  namespace: string;
}) => string;

export const getFleetResourceRoute: GetFleetResourceRouteProps = ({
  cluster,
  model,
  name,
  namespace,
}) => {
  const extensionModel = {
    group: model.apiGroup,
    kind: model.kind,
    version: model.apiVersion,
  } as ExtensionK8sModel;

  return model.namespaced
    ? getFleetNamespacedResourceRoute({
        cluster,
        model: extensionModel,
        name,
        namespace,
        resource: null,
      })
    : getFleetClusterResourceRoute({ cluster, model: extensionModel, name, resource: null });
};

export const getFleetNamespacedResourceRoute: ResourceRouteHandler = ({
  cluster,
  model,
  name,
  namespace,
}) => {
  const { group, kind, version } = model;

  return `/k8s/cluster/${cluster}/ns/${namespace}/${group}~${version}~${kind}/${name}`;
};

export const getFleetClusterResourceRoute: ResourceRouteHandler = ({ cluster, model, name }) => {
  const { group, kind, version } = model;

  return `/k8s/cluster/${cluster}/${group}~${version}~${kind}/${name}`;
};
