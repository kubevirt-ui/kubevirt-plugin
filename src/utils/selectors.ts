import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// annotations
export const getAnnotation = (
  entity: K8sResourceCommon,
  annotationName: string,
  defaultValue?: string,
): string => entity?.metadata?.annotations?.[annotationName] ?? defaultValue;

// labels
export const getLabel = (entity: K8sResourceCommon, label: string, defaultValue?: string): string =>
  entity?.metadata?.labels?.[label] ?? defaultValue;

// conditions
export const getConditionReason = (condition) => condition?.reason;
export const isConditionStatusTrue = (condition) => condition?.status === 'True';
export const getStatusConditions = (entity) => entity?.status?.conditions ?? [];

export const getStatusConditionsByType = (entity, type) =>
  getStatusConditions(entity)?.filter((condition) => condition?.type === type);
