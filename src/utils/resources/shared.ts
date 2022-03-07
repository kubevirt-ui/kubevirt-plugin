import { V1alpha1Condition } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// annotations
export const getAnnotation = (
  entity: K8sResourceCommon,
  annotationName: string,
  defaultValue?: string,
): string => entity?.metadata?.annotations?.[annotationName] ?? defaultValue;

// labels
export const getLabel = (entity: K8sResourceCommon, label: string, defaultValue?: string): string =>
  entity?.metadata?.labels?.[label] ?? defaultValue;

export const getResourceUrl = (model: K8sModel, resource: K8sResourceCommon): string => {
  if (!model || !resource) return null;

  const ref = `${model.apiGroup || 'core'}~${model.apiVersion}~${model.kind}`;

  const namespace = resource?.metadata?.namespace
    ? `ns/${resource.metadata.namespace}`
    : 'all-namespaces';

  return `/k8s/${namespace}/${ref}/${resource?.metadata?.name}`;
};

// conditions
export const getConditionReason = (condition: V1alpha1Condition): string => condition?.reason;
export const isConditionStatusTrue = (condition: V1alpha1Condition): boolean =>
  condition?.status === 'True';
export const getStatusConditions = (entity): V1alpha1Condition[] =>
  entity?.status?.conditions ?? [];

export const getStatusConditionsByType = (entity, type: string): V1alpha1Condition =>
  getStatusConditions(entity)?.find((condition) => condition?.type === type);
