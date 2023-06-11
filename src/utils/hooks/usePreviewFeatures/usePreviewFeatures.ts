import { useEffect, useState } from 'react';

import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import {
  getGroupVersionKindForModel,
  k8sCreate,
  k8sPatch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  PREVIEW_FEATURES_CONFIG_MAP_NAME,
  previewFeaturesConfigMapInitialState,
  previewFeaturesRole,
  previewFeaturesRoleBinding,
} from './constants';

export const usePreviewFeatures = () => {
  const [previewFeatureConfigMap, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    {
      groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
      isList: false,
      namespace: DEFAULT_NAMESPACE,
      name: PREVIEW_FEATURES_CONFIG_MAP_NAME,
    },
  );

  const [instanceTypesEnabled, setInstanceTypesEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    if (loaded) {
      setInstanceTypesEnabled(previewFeatureConfigMap?.data?.instanceTypesEnabled === 'true');
      setLoading(false);
      return;
    }

    if (loadError?.code === 404) {
      setError(loadError);

      const createResources = async () => {
        await k8sCreate<IoK8sApiCoreV1ConfigMap>({
          model: ConfigMapModel,
          data: previewFeaturesConfigMapInitialState,
        });

        await k8sCreate<IoK8sApiRbacV1Role>({
          model: RoleModel,
          data: previewFeaturesRole,
        });

        await k8sCreate<IoK8sApiRbacV1RoleBinding>({
          model: RoleBindingModel,
          data: previewFeaturesRoleBinding,
        });
      };

      try {
        createResources();
        setLoading(false);
        setError(null);
      } catch (createError) {
        setError(createError);
      }

      return;
    }
  }, [loadError, previewFeatureConfigMap, loaded]);

  const toggleInstanceTypesFeature = (value: boolean) => {
    try {
      k8sPatch({
        model: ConfigMapModel,
        resource: previewFeatureConfigMap,
        data: [
          {
            op: 'replace',
            path: '/data',
            value: { instanceTypesEnabled: value.toString() },
          },
        ],
      });
      setError(null);
    } catch (updateError) {
      setError(updateError);
    }
  };

  return {
    instanceTypesEnabled,
    toggleInstanceTypesFeature,
    loading,
    error,
  };
};
