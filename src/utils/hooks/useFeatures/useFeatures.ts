import { useCallback, useEffect, useRef, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { OPERATOR_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import {
  FEATURES_CONFIG_MAP_INITIAL_DATA,
  FEATURES_CONFIG_MAP_NAME,
  UI_FEATURES,
} from './constants';
import { applyMissingFeatures, createFeaturesConfigMap } from './createFeaturesConfigMap';
import { UseFeaturesValues } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

type UseFeatures = (featureName: string, clusterOverride?: string) => UseFeaturesValues;

export const useFeatures: UseFeatures = (featureName, clusterOverride) => {
  const [createError, setCreateError] = useState(null);
  const [createInProgress, setCreateInProgress] = useState(false);

  const isUIFeature = UI_FEATURES.includes(featureName);
  const clusterParam = useClusterParam();
  const configMapCluster = clusterOverride ?? (isUIFeature ? null : clusterParam);
  const cluster = configMapCluster ?? undefined;

  const { featuresConfigMapData, isAdmin } = useFeaturesConfigMap(configMapCluster, !createError);

  const [featureConfigMap, loaded, loadError] = featuresConfigMapData;
  const [featureEnabled, setFeatureEnabled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>(null);

  const prevClusterRef = useRef(cluster);
  useEffect(() => {
    if (prevClusterRef.current !== cluster) {
      prevClusterRef.current = cluster;
      setFeatureEnabled(null);
      setLoading(true);
      setError(null);
      setCreateError(null);
      setCreateInProgress(false);
    }
  }, [cluster]);

  useEffect(() => {
    if (createError || createInProgress) {
      return;
    }

    if (loadError?.code === 404) {
      setError(loadError);

      setCreateInProgress(true);
      (async () => {
        try {
          await createFeaturesConfigMap(cluster);
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
        case undefined:
        case null: {
          (async () => {
            try {
              await applyMissingFeatures(featureName, featureConfigMap, cluster);
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
    cluster,
  ]);

  const toggleFeature = useCallback(
    async (value: boolean) => {
      setLoading(true);

      try {
        const promise = await kubevirtK8sPatch({
          cluster,
          data: [{ op: 'replace', path: `/data/${featureName}`, value: value.toString() }],
          model: ConfigMapModel,
          resource: {
            data: {},
            metadata: {
              name: FEATURES_CONFIG_MAP_NAME,
              namespace: OPERATOR_NAMESPACE,
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
    [cluster, featureName],
  );

  return {
    canEdit: isAdmin,
    error,
    featureEnabled,
    loading: loading && !loadError,
    toggleFeature,
  };
};