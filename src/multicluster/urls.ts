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

import { FLEET_BASE_PATH, KUBEVIRT_VM_PATH } from './constants';

/**
 * Build a full URL for a spoke cluster console page by joining the spoke's
 * base console URL with a path. Trailing slashes on the base are normalised.
 */
export const buildSpokeConsoleUrl = (spokeConsoleURL: string, path: string): string => {
  const base = spokeConsoleURL.endsWith('/') ? spokeConsoleURL.slice(0, -1) : spokeConsoleURL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const isAllClusters = (cluster: string) => cluster === ALL_CLUSTERS_KEY;

export const isACMPath = (pathname: string): boolean => {
  if (pathname.startsWith(`${FLEET_BASE_PATH}/all-clusters`)) return true;

  const clusterMatch = matchPath(`${FLEET_BASE_PATH}/cluster/:cluster/*`, pathname);
  if (!clusterMatch || clusterMatch.params.cluster?.includes('~')) return false;

  const rest = clusterMatch.params['*'] ?? '';
  return rest.startsWith('ns/') || rest.startsWith('all-namespaces/') || rest.includes('~');
};

export const getACMVMURL = (cluster: string, namespace: string, name: string): string =>
  `${FLEET_BASE_PATH}/cluster/${cluster}/ns/${namespace}/${KUBEVIRT_VM_PATH}/${name}`;

export const getACMVMListURL = (cluster?: string, namespace?: string): string => {
  if (namespace && namespace !== ALL_NAMESPACES_SESSION_KEY) {
    if (!cluster || cluster === ALL_CLUSTERS_KEY) {
      return `${FLEET_BASE_PATH}/${ALL_CLUSTERS_KEY}/ns/${namespace}/${KUBEVIRT_VM_PATH}`;
    }
    return getACMVMListNamespacesURL(cluster, namespace);
  }

  return cluster && cluster !== ALL_CLUSTERS_KEY
    ? `${FLEET_BASE_PATH}/cluster/${cluster}/${ALL_NAMESPACES}/${KUBEVIRT_VM_PATH}`
    : `${FLEET_BASE_PATH}/${ALL_CLUSTERS_KEY}/${ALL_NAMESPACES}/${KUBEVIRT_VM_PATH}`;
};

export const getACMVMSearchURL = (): string =>
  `${FLEET_BASE_PATH}/${ALL_CLUSTERS_KEY}/${ALL_NAMESPACES}/${KUBEVIRT_VM_PATH}/search`;

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string =>
  `${FLEET_BASE_PATH}/cluster/${cluster}/ns/${namespace}/${KUBEVIRT_VM_PATH}`;

// based on dns1123LabelRegexp
const catalogWithNs = new RegExp('/ns/[-a-z0-9]+/catalog');

export const isCatalogURL = (path: string = ''): boolean =>
  path.includes(`${ALL_NAMESPACES}/catalog`) || catalogWithNs.test(path);

export const getCatalogURL = (cluster: string, namespace?: string): string => {
  const namespacePath = isAllNamespaces(namespace) ? ALL_NAMESPACES : `ns/${namespace}`;

  return cluster
    ? `${FLEET_BASE_PATH}/cluster/${cluster}/${namespacePath}/catalog`
    : `/k8s/${namespacePath}/catalog`;
};

export const getVMWizardURL = (cluster: string, namespace: string): string => {
  const namespacePath =
    namespace === ALL_NAMESPACES_SESSION_KEY ? ALL_NAMESPACES : `ns/${namespace}`;

  if (!cluster) return `/k8s/${namespacePath}/vmwizard`;

  return cluster === ALL_CLUSTERS_KEY
    ? `/k8s/${ALL_CLUSTERS_KEY}/${namespacePath}/vmwizard`
    : `/k8s/cluster/${cluster}/${namespacePath}/vmwizard`;
};

export const getConsoleStandaloneURL = (
  namespace: string,
  name: string,
  cluster?: string,
): string => {
  const commonPath = `/ns/${namespace}/${KUBEVIRT_VM_PATH}/${name}/console/standalone`;
  if (cluster) {
    return `${FLEET_BASE_PATH}/cluster/${cluster}${commonPath}`;
  }
  return `/k8s${commonPath}`;
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
    : getFleetClusterResourceRoute({ cluster, model: extensionModel, name });
};

export const getFleetNamespacedResourceRoute: ResourceRouteHandler = ({
  cluster,
  model,
  name,
  namespace,
}) => {
  const { group, kind, version } = model;

  return `${FLEET_BASE_PATH}/cluster/${cluster}/ns/${namespace}/${group}~${version}~${kind}/${name}`;
};

type GetClusterResourceRouteProps = (input: {
  cluster?: string;
  model: ExtensionK8sModel;
  name: string;
}) => string;

export const getFleetClusterResourceRoute: GetClusterResourceRouteProps = ({
  cluster,
  model,
  name,
}) => {
  const { group, kind, version } = model;

  return `${FLEET_BASE_PATH}/cluster/${cluster}/${group}~${version}~${kind}/${name}`;
};

export const getClusterResourceRoute: GetClusterResourceRouteProps = ({ cluster, model, name }) => {
  const { group, kind, version } = model;

  return cluster
    ? getFleetClusterResourceRoute({ cluster, model, name })
    : `/k8s/cluster/${group}~${version}~${kind}/${name}`;
};
