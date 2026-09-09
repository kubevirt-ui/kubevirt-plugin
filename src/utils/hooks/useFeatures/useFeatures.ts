import { useCallback, useEffect, useRef, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import { FEATURES_CONFIG_MAP_INITIAL_DATA, FEATURES_CONFIG_MAP_NAME } from './constants';
import { applyMissingFeatures, createFeaturesConfigMap } from './createFeaturesConfigMap';
import { type UseFeaturesValues } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

type ConfigMapLoadError = Error & { code?: number };

type UseFeatures = (featureName: string, clusterOverride?: string) => UseFeaturesValues;

export const useFeatures: UseFeatures = (featureName, clusterOverride) => {
  const [createError, setCreateError] = useState<Error | null>(null);
  const [createInProgress, setCreateInProgress] = useState(false);

  const clusterParam = useClusterParam();
  const configMapCluster = clusterOverride ?? clusterParam;
  const cluster = configMapCluster ?? undefined;
  const operatorNamespace = operatorNamespaceSignal.value;

  const { featuresConfigMapData, isAdmin } = useFeaturesConfigMap(configMapCluster, !createError);

  const configMapWatchResult = featuresConfigMapData as WatchK8sResult<IoK8sApiCoreV1ConfigMap>;
  const featureConfigMap = configMapWatchResult[0];
  const loaded = configMapWatchResult[1];
  const loadError = configMapWatchResult[2] as ConfigMapLoadError | undefined;
  const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);
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
    if (createError || createInProgress || !operatorNamespace) {
      return;
    }

    if (loadError?.code === 404) {
      setError(loadError);

      setCreateInProgress(true);
      void (async (): Promise<void> => {
        try {
          await createFeaturesConfigMap(cluster);
          setFeatureEnabled(FEATURES_CONFIG_MAP_INITIAL_DATA[featureName] === 'true');
          setError(null);
        } catch (configMapCreateError) {
          setLoading(false);
          setCreateError(configMapCreateError);
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
          void (async (): Promise<void> => {
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
          setFeatureEnabled(String(featureConfigMap?.data?.[featureName]) === 'true');
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
    cluster,
  ]);

  const toggleFeature = useCallback(
    async (value: boolean | string) => {
      if (!operatorNamespace) return;
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
    [cluster, featureName, operatorNamespace],
  );

  return {
    canEdit: isAdmin,
    error,
    featureEnabled,
    loading: loading && !loadError,
    toggleFeature,
  };
};
