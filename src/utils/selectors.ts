import { V1alpha1Condition } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
export const getConditionReason = (condition: V1alpha1Condition): string => condition?.reason;
export const isConditionStatusTrue = (condition: V1alpha1Condition): boolean =>
  condition?.status === 'True';
export const getStatusConditions = (entity): V1alpha1Condition[] =>
  entity?.status?.conditions ?? [];

export const getStatusConditionsByType = (entity, type: string): V1alpha1Condition =>
  getStatusConditions(entity)?.find((condition) => condition?.type === type);
