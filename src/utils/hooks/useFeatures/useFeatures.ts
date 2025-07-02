import { useCallback, useEffect, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { FEATURES_CONFIG_MAP_NAME, featuresConfigMapInitialState } from './constants';
import { applyMissingFeatures, createFeaturesConfigMap } from './createFeaturesConfigMap';
import { FeaturesType, UseFeaturesValues } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

type UseFeatures = (featureName: string) => UseFeaturesValues;

export const useFeatures: UseFeatures = (featureName: keyof FeaturesType) => {
  const [createError, setCreateError] = useState(null);
  const [createInProgress, setCreateInProgress] = useState(false);
  const { featuresConfigMapData, isAdmin } = useFeaturesConfigMap(!createError);
  const [featureConfigMap, loaded, loadError] = featuresConfigMapData;
  const [featureEnabled, setFeatureEnabled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    if (createError || createInProgress) {
      return;
    }

    if (loadError?.code === 404) {
      setError(loadError);

      setCreateInProgress(true);
      (async () => {
        try {
          await createFeaturesConfigMap();
          setFeatureEnabled(featuresConfigMapInitialState.data[featureName] === 'true');
          setError(null);
          // eslint-disable-next-line @typescript-eslint/no-shadow
        } catch (createError) {
          setLoading(false);
          setCreateError(createError);
        }
        setCreateInProgress(false);
      })();

      return;
    }

    if (!loaded && loadError) {
      setFeatureEnabled(false);
      setLoading(false);
    }

    if (loaded) {
      switch (featureConfigMap?.data?.[featureName]) {
        case 'true':
          setFeatureEnabled(true);
          break;
        case 'false': {
          setFeatureEnabled(false);
          break;
        }
        // In case of features config-map exists but there is a new feature to enter that is missing
        case undefined:
        case null: {
          (async () => {
            try {
              await applyMissingFeatures(featureName, featureConfigMap);
              setFeatureEnabled(featuresConfigMapInitialState.data[featureName] === 'true');
            } catch (updateError) {
              setError(updateError);
            }
          })();
          break;
        }
        default:
          setFeatureEnabled(featureConfigMap?.data?.[featureName]);
      }
      setLoading(false);
      return;
    }
  }, [
    loadError,
    featureConfigMap,
    loaded,
    featureName,
    featureEnabled,
    createError,
    createInProgress,
  ]);

  const toggleFeature = useCallback(
    async (value: boolean) => {
      setLoading(true);

      try {
        const promise = await k8sPatch({
          data: [{ op: 'replace', path: `/data/${featureName}`, value: value.toString() }],
          model: ConfigMapModel,
          resource: {
            data: {},
            metadata: {
              name: FEATURES_CONFIG_MAP_NAME,
              namespace: DEFAULT_OPERATOR_NAMESPACE,
            },
          },
        });
        setError(null);
        setFeatureEnabled(promise?.data?.[featureName] === 'true');
        setLoading(false);
        return promise;
      } catch (updateError) {
        setLoading(false);
        setError(updateError);
      }
    },
    [featureName],
  );

  return {
    canEdit: isAdmin,
    error,
    featureEnabled,
    loading: loading && !loadError,
    toggleFeature,
  };
};
