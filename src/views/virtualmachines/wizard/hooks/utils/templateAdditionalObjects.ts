import type { TFunction } from 'i18next';
import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildOwnerReference, getNamespace } from '@kubevirt-utils/resources/shared';
import { ensurePath, getErrorMessage, isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
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
): K8sModel | undefined => {
  const { group, kind, version } = getGroupVersionKindForResource(resource);
  const ref = [group ?? 'core', version, kind].join('~');

  return models[ref] ?? models[kind];
};

const shouldAddOwnerReference = (
  model: K8sModel | undefined,
  resourceNamespace: string | undefined,
  vmNamespace: string | undefined,
): boolean => {
  if (!model?.namespaced || !vmNamespace) {
    return false;
  }

  const objectNamespace = resourceNamespace ?? vmNamespace;

  return objectNamespace === vmNamespace;
};

const prepareTemplateAdditionalObject = (
  resource: K8sResourceCommon,
  createdVM: V1VirtualMachine,
  models: { [key: string]: K8sModel },
): { data: K8sResourceCommon; model: K8sModel | undefined } => {
  const model = getModelForResource(resource, models);
  const vmNamespace = getNamespace(createdVM);

  const data = produce(resource, (draft) => {
    if (model?.namespaced && vmNamespace) {
      ensurePath(draft, 'metadata');

      draft.metadata.namespace ??= vmNamespace;
    }

    if (shouldAddOwnerReference(model, draft.metadata?.namespace, vmNamespace)) {
      draft.metadata.ownerReferences = [
        ...(draft.metadata.ownerReferences ?? []),
        buildOwnerReference(createdVM, { blockOwnerDeletion: false }),
      ];
    }
  });

  return { data, model };
};

export const createTemplateAdditionalObjects = async (
  additionalObjects: K8sResourceCommon[],
  createdVM: V1VirtualMachine,
  models: { [key: string]: K8sModel },
  t: TFunction,
): Promise<void> => {
  if (isEmpty(additionalObjects)) {
    return;
  }

  const cluster = getCluster(createdVM);
  const results = await Promise.allSettled(
    additionalObjects.map((resource) => {
      const { data, model } = prepareTemplateAdditionalObject(resource, createdVM, models);

      return kubevirtK8sCreate<K8sResourceCommon>({
        cluster,
        data,
        model,
      });
    }),
  );

  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (failures.length > 0) {
    const errors = failures.map((failure) => getErrorMessage(failure.reason)).join('; ');
    kubevirtConsole.warn(t('Some template resources failed to create: {{errors}}', { errors }));
  }
};
