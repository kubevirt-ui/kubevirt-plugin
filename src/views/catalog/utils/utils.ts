import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import {
  getGroupVersionKindForResource,
  k8sCreate,
  k8sDelete,
  K8sModel,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import { ensurePath } from './WizardVMContext';

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
    model: VirtualMachineModel,
    data: vm as V1VirtualMachine,
  });

  try {
    const otherResourcesCreated = await Promise.all(
      otherResources.map((resource) => {
        const { group, version, kind } = getGroupVersionKindForResource(resource);

        const ref = [group || 'core', version, kind].join('~');

        const model = models[ref] || models[resource.kind];

        return k8sCreate<K8sResourceCommon>({
          model: model,
          data: produce(resource, (draftObject) => {
            ensurePath(draftObject, 'metadata');

            if (!draftObject.metadata.namespace && namespace) {
              draftObject.metadata.namespace = namespace;
            }

            if (!draftObject.metadata.ownerReferences) {
              draftObject.metadata.ownerReferences = [];
            }

            draftObject.metadata.ownerReferences.push(
              buildOwnerReference(vmCreated, { blockOwnerDeletion: false }),
            );
          }),
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
