import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SecretModel, V1Template } from '@kubevirt-utils/models';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { getTemplateOS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForResource,
  k8sCreate,
  k8sDelete,
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
export const createMultipleResources = async (
  resources: K8sResourceCommon[],
  models: { [key: string]: K8sModel },
  namespace?: string,
): Promise<K8sResourceCommon[]> => {
  const vm = resources.find((object) => object.kind === VirtualMachineModel.kind);
  const otherResources = resources.filter(
    (object) =>
      object.kind !== VirtualMachineModel.kind ||
      object.metadata.name !== vm.metadata.name ||
      object.metadata.namespace !== vm.metadata.namespace,
  );

  const vmCreated = await k8sCreate<V1VirtualMachine>({
    data: vm as V1VirtualMachine,
    model: VirtualMachineModel,
  });

  try {
    const otherResourcesCreated = await Promise.all(
      otherResources.map((resource) => {
        const { group, kind, version } = getGroupVersionKindForResource(resource);

        const ref = [group || 'core', version, kind].join('~');

        const model = models[ref] || models[resource.kind];

        return k8sCreate<K8sResourceCommon>({
          data: produce(resource, (draftObject) => {
            ensurePath(draftObject, 'metadata');

            if (!draftObject.metadata.namespace && namespace) {
              draftObject.metadata.namespace = namespace;
            }

            if (kind !== SecretModel.kind) {
              if (!draftObject.metadata.ownerReferences) {
                draftObject.metadata.ownerReferences = [];
              }

              draftObject.metadata.ownerReferences.push(
                buildOwnerReference(vmCreated, { blockOwnerDeletion: false }),
              );
            }
          }),
          model: model,
        });
      }),
    );

    return [vmCreated, ...(otherResourcesCreated || [])];
  } catch (error) {
    await k8sDelete({
      model: VirtualMachineModel,
      resource: vm,
    });

    throw error;
  }
};

export const isRHELTemplate = (template: V1Template): boolean =>
  getTemplateOS(template) === OS_NAME_TYPES.rhel;
