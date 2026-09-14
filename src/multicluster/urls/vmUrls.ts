import { type NavigateFunction } from 'react-router';

import {
  ALL_CLUSTERS_KEY,
  ALL_NAMESPACES,
  ALL_NAMESPACES_SESSION_KEY,
} from '@kubevirt-utils/hooks/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { FLEET_BASE_PATH, FLEET_VIRTUAL_MACHINES_PATH, FLEET_WIZARD_PATH } from '../constants';

import { VirtualMachineModel } from '../../views/dashboard-extensions/utils';

/**
 * Build a full URL for a spoke cluster console page by joining the spoke's
 * base console URL with a path. Trailing slashes on the base are normalised.
 */
export const buildSpokeConsoleUrl = (spokeConsoleURL: string, path: string): string => {
  const base = spokeConsoleURL.endsWith('/') ? spokeConsoleURL.slice(0, -1) : spokeConsoleURL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const isAllClusters = (cluster: string): boolean => cluster === ALL_CLUSTERS_KEY;

export const isACMPath = (pathname: string): boolean => {
  return pathname.startsWith(FLEET_BASE_PATH);
};

export const getACMVMURL = (cluster: string, namespace: string, name: string): string =>
  `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/${cluster}/ns/${namespace}/${name}`;

export const getACMVMListURL = (cluster?: string, namespace?: string): string => {
  if (namespace && namespace !== ALL_NAMESPACES_SESSION_KEY) {
    if (!cluster || cluster === ALL_CLUSTERS_KEY) {
      return `${FLEET_VIRTUAL_MACHINES_PATH}/${ALL_CLUSTERS_KEY}/ns/${namespace}`;
    }
    return getACMVMListNamespacesURL(cluster, namespace);
  }

  return cluster && cluster !== ALL_CLUSTERS_KEY
    ? `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/${cluster}/${ALL_NAMESPACES}`
    : `${FLEET_VIRTUAL_MACHINES_PATH}/${ALL_CLUSTERS_KEY}/${ALL_NAMESPACES}`;
};

export const getACMVMListNamespacesURL = (cluster: string, namespace: string): string =>
  `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/${cluster}/ns/${namespace}`;

export const isVMWizardURL = (path: string = ''): boolean =>
  path === '/vm-wizard' ||
  path.startsWith('/vm-wizard/') ||
  path === FLEET_WIZARD_PATH ||
  path.startsWith(`${FLEET_WIZARD_PATH}/`);

export const getVMWizardURL = (isACM?: boolean): string =>
  isACM ? FLEET_WIZARD_PATH : '/vm-wizard';

type NavigateToVMWizardParams = {
  cluster?: string;
  namespace?: string;
  navigate: NavigateFunction;
};

export const navigateToVMWizard = ({
  cluster,
  namespace,
  navigate,
}: NavigateToVMWizardParams): void => {
  navigate(getVMWizardURL(!isEmpty(cluster)), { state: { cluster, namespace } });
};

export const getConsoleStandaloneURL = (
  namespace: string,
  name: string,
  cluster?: string,
): string => {
  if (cluster) {
    return `${FLEET_VIRTUAL_MACHINES_PATH}/cluster/${cluster}/ns/${namespace}/${name}/console/standalone`;
  }
  const commonPath = `/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${name}/console/standalone`;
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

export const getACMTextSearchURL = (textSearch: string): string => {
  const encodedTextFilter = encodeURIComponent(textSearch);
  return `/multicloud/search?filters={"textsearch":"${encodedTextFilter}"}`;
};

export const getMulticlusterSearchURL = (
  model: K8sModel,
  name: string,
  namespace: string,
  cluster: string,
): string => {
  const urlSearch = new URLSearchParams();
  urlSearch.set('cluster', cluster);
  urlSearch.set('kind', model.kind);
  urlSearch.set('apiversion', `${model.apiGroup ?? 'core'}/${model.apiVersion}`);
  urlSearch.set('namespace', namespace);
  urlSearch.set('name', name);
  return `/multicloud/search/resources?${urlSearch.toString()}`;
};
