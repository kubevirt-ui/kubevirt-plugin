import { useCallback, useEffect, useState } from 'react';
import produce from 'immer';

import { ConfigMapModel, RoleBindingModel, RoleModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { featuresConfigMapInitialState, featuresRole, featuresRoleBinding } from './constants';
import { UseFeaturesValues } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

type UseFeatures = (featureName: string) => UseFeaturesValues;

export const useFeatures: UseFeatures = (featureName) => {
  const {
    featuresConfigMapData: [featureConfigMap, loaded, loadError],
    isAdmin,
  } = useFeaturesConfigMap();

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
        setFeatureEnabled(featuresConfigMapInitialState.data[featureName] === 'true');
        setLoading(false);
        setError(null);
      } catch (createError) {
        setError(createError);
      }

      return;
    }

    if (!loaded && loadError && loadError?.code !== 404) {
      setFeatureEnabled(false);
      setLoading(false);
    }
  }, [loadError, featureConfigMap, loaded, featureName]);

  const toggleFeature = useCallback(
    async (value: boolean) => {
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
    },
    [featureConfigMap, featureName],
  );

  return {
    canEdit: isAdmin,
    error,
    featureEnabled,
    loading,
    toggleFeature,
  };
};
