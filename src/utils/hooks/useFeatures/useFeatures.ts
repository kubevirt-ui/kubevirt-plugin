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
  FEATURES_CONFIG_MAP_NAME,
  featuresConfigMapInitialState,
  featuresRole,
  featuresRoleBinding,
} from './constants';

type UseFeatures = (featureName: string) => {
  canEdit: boolean;
  error: Error;
  featureEnabled: boolean;
  loading: boolean;
  toggleFeature: (val: boolean) => Promise<IoK8sApiCoreV1ConfigMap>;
};

export const useFeatures: UseFeatures = (featureName) => {
  const isAdmin = useIsAdmin();

  const [featureConfigMap, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>({
    groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
    isList: false,
    name: FEATURES_CONFIG_MAP_NAME,
    namespace: DEFAULT_NAMESPACE,
  });

  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    if (loaded) {
      setFeatureEnabled(featureConfigMap?.data?.[featureName] === 'true');
      setLoading(false);
      return;
    }

    if (loadError?.code === 404) {
      setError(loadError);

      const createResources = async () => {
        await k8sCreate<IoK8sApiCoreV1ConfigMap>({
          data: featuresConfigMapInitialState,
          model: ConfigMapModel,
        });

        await k8sCreate<IoK8sApiRbacV1Role>({
          data: featuresRole,
          model: RoleModel,
        });

        await k8sCreate<IoK8sApiRbacV1RoleBinding>({
          data: featuresRoleBinding,
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
  }, [loadError, featureConfigMap, loaded, featureName]);

  const toggleFeature = async (value: boolean) => {
    const updatedConfigMap = produce(featureConfigMap, (draftCM) => {
      if (isEmpty(draftCM?.data)) draftCM.data = {};
      draftCM.data[featureName] = value.toString();
    });
    setLoading(true);

    try {
      const promise = await k8sUpdate({
        data: updatedConfigMap,
        model: ConfigMapModel,
      });
      setLoading(false);
      setError(null);
      return promise;
    } catch (updateError) {
      setLoading(false);
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
