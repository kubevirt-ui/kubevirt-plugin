import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, modelToRef, StorageClassModel } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import {
  type Action,
  type ExtensionHook,
  k8sPatch,
  type K8sResourceCommon,
  type K8sResourceKind,
  useK8sModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION } from '../../constants';

const hasDefaultVirtAnnotation = (resource: K8sResourceCommon): boolean =>
  resource.metadata?.annotations?.[DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION] === 'true';

const useStorageClassActionsProvider: ExtensionHook<Action[], K8sResourceKind> = (storageClass) => {
  const { t } = useKubevirtTranslation();
  const [, inFlight] = useK8sModel(modelToRef(StorageClassModel));

  const [storageClasses] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const existingDefaultVirtStorageClass = useMemo(
    () => storageClasses.find(hasDefaultVirtAnnotation),
    [storageClasses],
  );

  const isDefaultVirtStorageClass = hasDefaultVirtAnnotation(storageClass);

  const actions = useMemo<Action[]>(
    () => [
      {
        accessReview: asAccessReview(StorageClassModel, storageClass, 'patch'),
        cta: async () => {
          await k8sPatch({
            data: [
              ...(!storageClass?.metadata?.annotations
                ? [
                    {
                      op: 'add',
                      path: '/metadata/annotations',
                      value: {},
                    },
                  ]
                : []),
              {
                op: 'replace',
                path: `/metadata/annotations/${DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION.replace(
                  '/',
                  '~1',
                )}`,
                value: 'true',
              },
            ],
            model: StorageClassModel,
            resource: storageClass,
          });

          if (existingDefaultVirtStorageClass) {
            await k8sPatch({
              data: [
                {
                  op: 'replace',
                  path: `/metadata/annotations/${DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION.replace(
                    '/',
                    '~1',
                  )}`,
                  value: 'false',
                },
              ],
              model: StorageClassModel,
              resource: existingDefaultVirtStorageClass,
            });
          }
        },
        disabled: isDefaultVirtStorageClass,
        disabledTooltip: isDefaultVirtStorageClass
          ? t('Current default StorageClass for VirtualMachines')
          : null,
        id: 'make-kubevirt-default-storageclass',
        insertAfter: 'make-default-storageclass',
        label: t('Set as default for VirtualMachines'),
      } as Action,
    ],
    [storageClass, t, isDefaultVirtStorageClass, existingDefaultVirtStorageClass],
  );

  return [actions, !inFlight, undefined];
};

export default useStorageClassActionsProvider;
