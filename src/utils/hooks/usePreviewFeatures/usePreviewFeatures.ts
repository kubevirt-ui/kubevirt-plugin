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
  canEdit: boolean;
  error: Error;
  featureEnabled: boolean;
  loading: boolean;
  toggleFeature: (val: boolean) => void;
};

export const usePreviewFeatures: UsePreviewFeatures = (featureName) => {
  const isAdmin = useIsAdmin();

  const [previewFeatureConfigMap, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    {
      groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
      isList: false,
      name: PREVIEW_FEATURES_CONFIG_MAP_NAME,
      namespace: DEFAULT_NAMESPACE,
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
          data: previewFeaturesConfigMapInitialState,
          model: ConfigMapModel,
        });

        await k8sCreate<IoK8sApiRbacV1Role>({
          data: previewFeaturesRole,
          model: RoleModel,
        });

        await k8sCreate<IoK8sApiRbacV1RoleBinding>({
          data: previewFeaturesRoleBinding,
          model: RoleBindingModel,
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
        data: updatedConfigMap,
        model: ConfigMapModel,
      });
      setError(null);
    } catch (updateError) {
      setError(updateError);
    }
  };

  return {
    canEdit: isAdmin,
    error,
    featureEnabled,
    loading,
    toggleFeature,
  };
};
