import produce from 'immer';

import {
  getGroupVersionKindForResource,
  k8sCreate,
  K8sModel,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

/**
 * create multiple resources from a list of dynamic objects
 * @param resources - resources to create
 * @param models - k8s models
 * @param namespace - namespace to create resources in
 * @returns promise of created resources
 */
export const createMultipleResources = (
  resources: K8sResourceCommon[],
  models: { [key: string]: K8sModel },
  namespace?: string,
): Promise<K8sResourceCommon[]> =>
  Promise.all(
    resources.map((resource) => {
      const { group, version, kind } = getGroupVersionKindForResource(resource);

      const ref = [group || 'core', version, kind].join('~');

      const model = models[ref] || models[resource.kind];

      return k8sCreate<K8sResourceCommon>({
        model: model,
        data: produce(resource, (draftObject) => {
          if (!draftObject.metadata.namespace && namespace) {
            draftObject.metadata.namespace = namespace;
          }
        }),
      });
    }),
  );
