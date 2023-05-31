import { useEffect, useState } from 'react';

import {
  ConfigMapModel,
  GroupModel,
  RoleBindingModel,
  RoleModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  k8sCreate,
  k8sPatch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

const PREVIEW_FEATURES_CONFIG_MAP_NAME = 'kubevirt-ui-preview-features';
const PREVIEW_FEATURES_ROLE_NAME = 'kubevirt-ui-preview-features-reader';
const PREVIEW_FEATURES_ROLE_BINDING_NAME = 'kubevirt-ui-preview-features-reader-binding';

export const usePreviewFeatures = () => {
  const [previewFeatureConfigMap, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    {
      groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
      isList: false,
      namespace: DEFAULT_NAMESPACE,
      name: PREVIEW_FEATURES_CONFIG_MAP_NAME,
    },
  );

  const [error, setError] = useState<Error>(null);
  const [loading, setLoading] = useState<boolean>(!loaded && isEmpty(loadError));
  useEffect(() => {
    if (!isEmpty(loadError)) {
      // config map is not found
      try {
        k8sCreate<IoK8sApiCoreV1ConfigMap>({
          model: ConfigMapModel,
          data: {
            metadata: {
              name: PREVIEW_FEATURES_CONFIG_MAP_NAME,
              namespace: DEFAULT_NAMESPACE,
            },
            data: { instanceTypesEnabled: 'false' },
          },
        })
          .then(() => {
            k8sCreate<IoK8sApiRbacV1Role>({
              model: RoleModel,
              data: {
                metadata: {
                  name: PREVIEW_FEATURES_ROLE_NAME,
                  namespace: DEFAULT_NAMESPACE,
                },
                rules: [
                  {
                    apiGroups: [''],
                    resources: [ConfigMapModel.plural],
                    resourceNames: [PREVIEW_FEATURES_CONFIG_MAP_NAME],
                    verbs: ['list', 'get'],
                  },
                ],
              },
            });
          })
          .then(() => {
            k8sCreate<IoK8sApiRbacV1RoleBinding>({
              model: RoleBindingModel,
              data: {
                metadata: {
                  name: PREVIEW_FEATURES_ROLE_BINDING_NAME,
                  namespace: DEFAULT_NAMESPACE,
                },
                subjects: [
                  {
                    kind: GroupModel.kind,
                    name: 'system:authenticated',
                    apiGroup: RoleModel.apiGroup,
                  },
                ],
                roleRef: {
                  kind: RoleModel.kind,
                  name: PREVIEW_FEATURES_ROLE_NAME,
                  apiGroup: RoleModel.apiGroup,
                },
              },
            });
          });
      } catch (createError) {
        setError(createError);
      }
    }

    setLoading(isEmpty(previewFeatureConfigMap));
  }, [loadError, previewFeatureConfigMap]);

  const toggleInstanceTypesFeature = (value: boolean) => {
    try {
      k8sPatch({
        model: ConfigMapModel,
        resource: previewFeatureConfigMap,
        data: [
          {
            op: 'replace',
            path: '/data',
            value: { instanceTypesEnabled: String(value) },
          },
        ],
      });
    } catch (updateError) {
      setError(updateError);
    }
  };

  return {
    instanceTypesEnabled: previewFeatureConfigMap?.data?.instanceTypesEnabled === 'true',
    toggleInstanceTypesFeature,
    loading,
    error,
  };
};
