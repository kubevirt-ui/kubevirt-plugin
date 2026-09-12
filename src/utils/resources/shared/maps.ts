import { getCluster } from '@multicluster/helpers/selectors';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { SINGLE_CLUSTER_KEY } from '../constants';

type K8sResource = { metadata?: { name?: string; namespace?: string } };

export type ResourceMap<A> = { [name: string]: A };
export type NamespacedResourceMap<A> = { [namespace: string]: ResourceMap<A> };

export function convertResourceArrayToMap<A extends K8sResource>(
  resources: A[],
  isNamespaced: true,
): NamespacedResourceMap<A>;

export function convertResourceArrayToMap<A extends K8sResource>(
  resources: A[],
  isNamespaced?: false,
): ResourceMap<A>;

export function convertResourceArrayToMap<A extends K8sResource>(
  resources: A[],
  isNamespaced?: boolean,
): NamespacedResourceMap<A> | ResourceMap<A> {
  return (resources ?? []).reduce(
    (map, resource) => {
      const { name, namespace } = resource?.metadata ?? {};

      if (isNamespaced) {
        if (!map[namespace]) map[namespace] = {};
        (map[namespace] as ResourceMap<A>)[name] = resource;
        return map;
      }

      (map as ResourceMap<A>)[name] = resource;
      return map;
    },
    isNamespaced ? ({} as NamespacedResourceMap<A>) : ({} as ResourceMap<A>),
  );
}

export type ClusterNamespacedResourceMap<A> = {
  [cluster: string]: NamespacedResourceMap<A>;
};
export type ClusterResourceMap<A> = {
  [cluster: string]: ResourceMap<A>;
};

export function convertResourceArrayToMapWithCluster<
  A extends K8sResourceCommon = K8sResourceCommon,
>(resources: A[], isNamespaced: true): ClusterNamespacedResourceMap<A>;

export function convertResourceArrayToMapWithCluster<
  A extends K8sResourceCommon = K8sResourceCommon,
>(resources: A[], isNamespaced?: false): ClusterResourceMap<A>;

export function convertResourceArrayToMapWithCluster<
  A extends K8sResourceCommon = K8sResourceCommon,
>(resources: A[], isNamespaced?: boolean): ClusterNamespacedResourceMap<A> | ClusterResourceMap<A> {
  return (resources ?? []).reduce(
    (map, resource) => {
      const cluster = getClusterKey(resource);
      const { name, namespace } = resource?.metadata ?? {};
      map[cluster] ??= {};

      if (isNamespaced) {
        if (!map[cluster][namespace]) {
          map[cluster][namespace] = {};
        }
        (map[cluster] as NamespacedResourceMap<A>)[namespace][name] = resource;
      } else {
        (map[cluster] as ResourceMap<A>)[name] = resource;
      }
      return map;
    },
    isNamespaced ? ({} as ClusterNamespacedResourceMap<A>) : ({} as ClusterResourceMap<A>),
  );
}

export const getResourceFromClusterMap = <A extends K8sResourceCommon = K8sResourceCommon>(
  clusterMap: ClusterNamespacedResourceMap<A> | ClusterResourceMap<A>,
  cluster: string,
  namespace: string,
  name: string,
): A => clusterMap?.[cluster ?? SINGLE_CLUSTER_KEY]?.[namespace]?.[name];

export const getClusterKey = (resource: K8sResourceCommon): string =>
  getCluster(resource) ?? SINGLE_CLUSTER_KEY;
