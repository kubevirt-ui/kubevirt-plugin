import { getCluster } from '@multicluster/helpers/selectors';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { ANNOTATIONS } from '../template';

export const getDescription = (entity: K8sResourceCommon): string =>
  entity?.metadata?.annotations?.description;

export const getLabels = (
  entity: K8sResourceCommon,
  defaultValue?: { [key: string]: string },
): { [key: string]: string } => entity?.metadata?.labels ?? defaultValue;

export const getAnnotations = (
  entity: K8sResourceCommon,
  defaultValue?: { [key: string]: string },
): { [key: string]: string } | undefined => entity?.metadata?.annotations ?? defaultValue;

export const getAnnotation = (
  entity: K8sResourceCommon,
  annotationName: string,
  defaultValue?: string,
): string | undefined => entity?.metadata?.annotations?.[annotationName] ?? defaultValue;

export const getDisplayName = (entity: K8sResourceCommon): string | undefined =>
  getAnnotation(entity, ANNOTATIONS.displayName);

export const getIconClass = (entity: K8sResourceCommon): string | undefined =>
  getAnnotation(entity, ANNOTATIONS.iconClass);

export const getLabel = (
  entity: K8sResourceCommon,
  label: string,
  defaultValue?: string,
): string | undefined => entity?.metadata?.labels?.[label] ?? defaultValue;

export const getName = <A extends K8sResourceCommon = K8sResourceCommon>(
  resource: A,
): string | undefined => resource?.metadata?.name;

export const getNamespace = <A extends K8sResourceCommon = K8sResourceCommon>(
  resource: A,
): string | undefined => resource?.metadata?.namespace;

export const getKind = <A extends K8sResourceCommon = K8sResourceCommon>(
  resource: A,
): string | undefined => resource?.kind;

export const getUID = <A extends K8sResourceCommon = K8sResourceCommon>(resource: A): string =>
  resource?.metadata?.uid;

export const getClusterNamespaceNameKey = (
  cluster: string,
  namespace: string,
  name: string,
): string => `${cluster ?? ''}/${namespace}/${name}`;

export const getCreationTimestamp = (entity: K8sResourceCommon): string =>
  entity?.metadata?.creationTimestamp;

export const findOwnerRefByKind = (resource: K8sResourceCommon, kind: string): string | undefined =>
  resource?.metadata?.ownerReferences?.find((ref) => ref.kind === kind)?.name;

export const getLongestNameLength = (resources: K8sResourceCommon[]): number =>
  Math.max(...(resources ?? []).map((resource) => getName(resource)?.length ?? 0));

export const haveSamePropValue = (
  resources: K8sResourceCommon[],
  getPropValue: (resource: K8sResourceCommon) => string,
): boolean => {
  if (resources.length <= 1) return true;

  const value = getPropValue(resources[0]);
  return resources.every((resource) => getPropValue(resource) === value);
};

export const haveSameNamespace = (resources: K8sResourceCommon[]): boolean =>
  haveSamePropValue(resources, getNamespace);

export const haveSameCluster = (resources: K8sResourceCommon[]): boolean =>
  haveSamePropValue(resources, getCluster);

export const getResourceKey = (resource: K8sResourceCommon): string =>
  `${getKind(resource)}/${getCluster(resource) ?? ''}/${getNamespace(resource)}/${getName(resource)}`;
