import { useCallback, useEffect, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { operatorNamespaceSignal } from '@kubevirt-utils/hooks/useOperatorNamespace/useOperatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  FEATURES_CONFIG_MAP_INITIAL_DATA,
  FEATURES_CONFIG_MAP_NAME,
  UI_FEATURES,
} from './constants';
import { applyMissingFeatures, createFeaturesConfigMap } from './createFeaturesConfigMap';
import { UseFeaturesValues } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

type UseFeatures = (featureName: string) => UseFeaturesValues;

export const useFeatures: UseFeatures = (featureName) => {
  const [createError, setCreateError] = useState(null);
  const [createInProgress, setCreateInProgress] = useState(false);

  const isUIFeature = UI_FEATURES.includes(featureName);
  const cluster = useClusterParam();
  const operatorNamespace = operatorNamespaceSignal.value;

  const { featuresConfigMapData, isAdmin } = useFeaturesConfigMap(
    isUIFeature ? null : cluster,
    !createError,
  );

  const [featureConfigMap, loaded, loadError] = featuresConfigMapData;
  const [featureEnabled, setFeatureEnabled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>(null);

  useEffect(() => {
    if (createError || createInProgress || !operatorNamespace) {
      return;
    }

    if (loadError?.code === 404) {
      setError(loadError);

      setCreateInProgress(true);
      (async () => {
        try {
          await createFeaturesConfigMap();
          setFeatureEnabled(FEATURES_CONFIG_MAP_INITIAL_DATA[featureName] === 'true');
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
              setFeatureEnabled(FEATURES_CONFIG_MAP_INITIAL_DATA[featureName] === 'true');
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
    operatorNamespace,
  ]);

  const toggleFeature = useCallback(
    async (value: boolean) => {
      if (!operatorNamespace) return;
      setLoading(true);

      try {
        const promise = await k8sPatch({
          data: [{ op: 'replace', path: `/data/${featureName}`, value: value.toString() }],
          model: ConfigMapModel,
          resource: {
            data: {},
            metadata: {
              name: FEATURES_CONFIG_MAP_NAME,
              namespace: operatorNamespace,
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
    [featureName, operatorNamespace],
  );

  return {
    canEdit: isAdmin,
    error,
    featureEnabled,
    loading: loading && !loadError,
    toggleFeature,
  };
};
