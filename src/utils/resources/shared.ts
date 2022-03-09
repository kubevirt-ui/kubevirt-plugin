import { V1alpha1Condition } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * function for getting an entity's annotation
 * @param entity - entity to get annotation from
 * @param annotationName - name of the annotation to get
 * @param defaultValue - default value to return if annotation is not found
 * @returns the annotation value or defaultValue if not found
 */
export const getAnnotation = (
  entity: K8sResourceCommon,
  annotationName: string,
  defaultValue?: string,
): string => entity?.metadata?.annotations?.[annotationName] ?? defaultValue;

/**
 * function for getting an entity's label
 * @param {K8sResourceCommon} entity - entity to get label from
 * @param {string} label - name of the label to get
 * @param {string} defaultValue - default value to return if label is not found
 * @returns the label value or defaultValue if not found
 */
export const getLabel = (entity: K8sResourceCommon, label: string, defaultValue?: string): string =>
  entity?.metadata?.labels?.[label] ?? defaultValue;

/**
 * function for getting a resource URL
 * @param {k8sModel} model - model to get the URL from
 * @param {K8sResourceCommon} resource - resource to get the URL from
 * @returns the URL for the resource
 */
export const getResourceUrl = (model: K8sModel, resource: K8sResourceCommon): string => {
  if (!model || !resource) return null;

  const ref = `${model.apiGroup || 'core'}~${model.apiVersion}~${model.kind}`;

  const namespace = resource?.metadata?.namespace
    ? `ns/${resource.metadata.namespace}`
    : 'all-namespaces';

  return `/k8s/${namespace}/${ref}/${resource?.metadata?.name}`;
};

/**
 * function for getting a condition's reason
 * @param condition - condition to check
 * @returns condition's reason
 */
export const getConditionReason = (condition: V1alpha1Condition): string => condition?.reason;

/**
 * function for checking if a condition is true
 * @param condition - condition to check
 * @returns true if condition is true, false otherwise
 */
export const isConditionStatusTrue = (condition: V1alpha1Condition): boolean =>
  condition?.status === 'True';

/**
 * A selector for a resource's conditions
 * @param entity - entity to get condition from
 * @returns array of conditions
 */
export const getStatusConditions = (entity): V1alpha1Condition[] =>
  entity?.status?.conditions ?? [];

/**
 * A selector for a resource's conditions based on type
 * @param entity - entity to get condition from
 * @param type - type of the condition
 * @returns condition based on type
 */
export const getStatusConditionsByType = (entity, type: string): V1alpha1Condition =>
  getStatusConditions(entity)?.find((condition) => condition?.type === type);
