import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildOwnerReference, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import {
  getGroupVersionKindForResource,
  type K8sModel,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

const getModelForResource = (
  resource: K8sResourceCommon,
  models: { [key: string]: K8sModel },
): K8sModel => {
  const { group, kind, version } = getGroupVersionKindForResource(resource);
  const ref = [group ?? 'core', version, kind].join('~');

  return models[ref] ?? models[kind];
};

export const createTemplateAdditionalObjects = async (
  additionalObjects: K8sResourceCommon[],
  createdVM: V1VirtualMachine,
  models: { [key: string]: K8sModel },
): Promise<K8sResourceCommon[]> => {
  if (!additionalObjects.length) {
    return [];
  }

  const cluster = getCluster(createdVM);
  const namespace = getNamespace(createdVM);

  return Promise.all(
    additionalObjects.map((resource) => {
      const model = getModelForResource(resource, models);
      const data = produce(resource, (draft) => {
        draft.metadata = draft.metadata ?? {};

        if (!draft.metadata.namespace && namespace) {
          draft.metadata.namespace = namespace;
        }

        draft.metadata.ownerReferences = [
          ...(draft.metadata.ownerReferences ?? []),
          buildOwnerReference(createdVM, { blockOwnerDeletion: false }),
        ];
      });

      return kubevirtK8sCreate<K8sResourceCommon>({
        cluster,
        data,
        model,
      });
    }),
  );
};
