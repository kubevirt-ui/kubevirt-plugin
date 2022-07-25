import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1Condition, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { TemplateModel } from '@kubevirt-utils/models';
import {
  AccessReviewResourceAttributes,
  K8sModel,
  K8sResourceCommon,
  K8sVerb,
  Operator,
  OwnerReference,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

import { isEmpty } from './../utils/utils';
import { TEMPLATE_TYPE_LABEL } from './template';

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

/**
 * function for creating a resource's owner reference from a resource
 * @param {K8sResourceCommon} owner resource to create an owner reference from
 * @param opts optional addinional options
 * @param {boolean} opts.blockOwnerDeletion http://kubevirt.io/api-reference/v0.51.0/definitions.html#_k8s_io_apimachinery_pkg_apis_meta_v1_ownerreference
 * @param {boolean} opts.controller http://kubevirt.io/api-reference/v0.51.0/definitions.html#_k8s_io_apimachinery_pkg_apis_meta_v1_ownerreference
 * @returns a resource's owner reference
 */
export const buildOwnerReference = (
  owner: K8sResourceCommon,
  opts: { blockOwnerDeletion?: boolean; controller?: boolean } = { blockOwnerDeletion: true },
): OwnerReference => ({
  apiVersion: owner?.apiVersion,
  kind: owner?.kind,
  name: owner?.metadata?.name,
  uid: owner?.metadata?.uid,
  blockOwnerDeletion: opts && opts.blockOwnerDeletion,
  controller: opts && opts.controller,
});

/**
 * function to compare two OwnerReference objects
 * @param {OwnerReference} obj first object to compare
 * @param {OwnerReference} otherObj second object to compare
 * @returns a boolean indicating if the objects are equal
 */
export const compareOwnerReferences = (obj: OwnerReference, otherObj: OwnerReference): boolean => {
  if (obj === otherObj) {
    return true;
  }
  if (!obj || !otherObj) {
    return false;
  }

  return (
    obj?.uid === otherObj?.uid ||
    obj?.name === otherObj?.name ||
    obj?.apiVersion === otherObj?.apiVersion ||
    obj?.kind === otherObj?.kind
  );
};

/**
 * function to build AccessReviewResourceAttributes from a resource
 * @param model - k8s model
 * @param obj - resource
 * @param verb - verb
 * @param subresource - subresource
 * @returns AccessReviewResourceAttributes
 */
export const asAccessReview = (
  model: K8sModel,
  obj: K8sResourceCommon,
  verb: K8sVerb,
  subresource?: string,
): AccessReviewResourceAttributes => {
  if (!obj) {
    console.warn('review obj should not be null');
    return null;
  }
  return {
    group: model.apiGroup,
    resource: model.plural,
    name: obj?.metadata?.name,
    namespace: obj?.metadata?.namespace,
    verb,
    subresource,
  };
};

/**
 * Provides apiVersion for a k8s model.
 * @param model k8s model
 * @returns The apiVersion for the model i.e `group/version`.
 * */
export const getAPIVersionForModel = (model: K8sModel): string =>
  !model?.apiGroup ? model.apiVersion : `${model.apiGroup}/${model.apiVersion}`;

/**
 * Get vm printable status
 * @date 7/6/2022 - 11:23:32 AM
 *
 * @param {V1VirtualMachine} vm - vm to get status from
 * @returns {*}
 */
export const getVMStatus = (vm: V1VirtualMachine) => vm?.status?.printableStatus;

/**
 * Get allowed resource for project
 * @date 7/6/2022 - 11:23:32 AM
 *
 * @param {string[]} projectNames - project names
 * @param {K8sModel} model - k8s model
 * @returns {*}
 */
export const getAllowedResources = (projectNames: string[], model: K8sModel) => {
  return Object.fromEntries(
    (projectNames || []).map((projName) => [
      `${projName}/${model.plural}`,
      {
        groupVersionKind: modelToGroupVersionKind(model),
        namespaced: true,
        namespace: projName,
        isList: true,
      },
    ]),
  );
};

/**
 * Get allowed resources data
 * @date 7/6/2022 - 11:23:32 AM
 *
 * @param {WatchK8sResults<{
    [key: string]: K8sResourceCommon[];
  }>} resources - resources
 * @param {K8sModel} model - k8s model
 * @returns {{ data: any; loaded: any; loadError: any; }}
 */
export const getAllowedResourceData = (
  resources: WatchK8sResults<{
    [key: string]: K8sResourceCommon[];
  }>,
  model: K8sModel,
) => {
  const resourcesArray = Object.entries(resources)
    .map(([key, { data, loaded, loadError }]) => {
      if (loaded && key?.includes(model.plural) && !isEmpty(data)) {
        return { data, loaded, loadError };
      }
    })
    .filter(Boolean);

  const resourceData = (resourcesArray || []).map(({ data }) => data).flat();
  const resourceLoaded = (resourcesArray || [])
    .map(({ loaded }) => loaded)
    ?.every((vmLoaded) => vmLoaded);
  const resourceLoadError = (resourcesArray || [])
    .map(({ loadError }) => loadError)
    ?.filter(Boolean)
    ?.join('');
  return { data: resourceData, loaded: resourceLoaded, loadError: resourceLoadError };
};

/**
 * Get allowed templates resources
 * @date 7/6/2022 - 11:23:32 AM
 *
 * @param {string[]} projectNames - project names
 * @returns {*}
 */
export const getAllowedTemplateResources = (projectNames: string[]) => {
  const TemplateModelGroupVersionKind = modelToGroupVersionKind(TemplateModel);
  return Object.fromEntries(
    (projectNames || []).map((projName) => [
      `${projName}/${TemplateModel.plural}`,
      {
        groupVersionKind: TemplateModelGroupVersionKind,
        namespace: projName,
        selector: {
          matchExpressions: [
            {
              operator: Operator.Exists,
              key: TEMPLATE_TYPE_LABEL,
            },
          ],
        },
        isList: true,
      },
    ]),
  );
};
