import { useEffect, useState } from 'react';
import produce from 'immer';

import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
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
  k8sUpdate,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { useIsAdmin } from '../useIsAdmin';

import {
  PREVIEW_FEATURES_CONFIG_MAP_NAME,
  previewFeaturesConfigMapInitialState,
  previewFeaturesRole,
  previewFeaturesRoleBinding,
} from './constants';

type UsePreviewFeatures = (featureName: string) => {
  featureEnabled: boolean;
  toggleFeature: (val: boolean) => void;
  canEdit: boolean;
  loading: boolean;
  error: Error;
};

export const usePreviewFeatures: UsePreviewFeatures = (featureName) => {
  const isAdmin = useIsAdmin();

  const [previewFeatureConfigMap, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    {
      groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
      isList: false,
      namespace: DEFAULT_NAMESPACE,
      name: PREVIEW_FEATURES_CONFIG_MAP_NAME,
    },
  );

  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    if (loaded) {
      setFeatureEnabled(previewFeatureConfigMap?.data?.[featureName] === 'true');
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
  }, [loadError, previewFeatureConfigMap, loaded, featureName]);

  const toggleFeature = (value: boolean) => {
    const updatedConfigMap = produce(previewFeatureConfigMap, (draftCM) => {
      if (isEmpty(draftCM?.data)) draftCM.data = {};
      draftCM.data[featureName] = value.toString();
    });

    try {
      k8sUpdate({
        model: ConfigMapModel,
        data: updatedConfigMap,
      });
      setError(null);
    } catch (updateError) {
      setError(updateError);
    }
  };

  return {
    featureEnabled,
    toggleFeature,
    canEdit: isAdmin,
    loading,
    error,
  };
};
