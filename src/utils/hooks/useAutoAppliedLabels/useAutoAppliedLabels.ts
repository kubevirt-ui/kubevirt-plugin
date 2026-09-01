import { useCallback, useMemo, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { AUTO_APPLIED_LABELS } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import { type AutoAppliedLabel, type UseAutoAppliedLabelsResult } from './types';

const isAutoAppliedLabel = (entry: unknown): entry is AutoAppliedLabel =>
  typeof entry === 'object' &&
  entry !== null &&
  typeof (entry as AutoAppliedLabel).key === 'string' &&
  typeof (entry as AutoAppliedLabel).value === 'string' &&
  typeof (entry as AutoAppliedLabel).required === 'boolean';

const parseLabels = (raw: string | undefined): AutoAppliedLabel[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isAutoAppliedLabel) : [];
  } catch {
    return [];
  }
};

const useAutoAppliedLabels = (cluster?: string): UseAutoAppliedLabelsResult => {
  const settingsCluster = useSettingsCluster();
  const resolvedCluster = cluster ?? settingsCluster;
  const { featuresConfigMapData, isAdmin } = useFeaturesConfigMap(resolvedCluster);
  const [featureConfigMap, loaded] = featuresConfigMapData;
  const loadError: unknown = featuresConfigMapData[2];
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const labels = useMemo(
    () => parseLabels(featureConfigMap?.data?.[AUTO_APPLIED_LABELS]),
    [featureConfigMap?.data],
  );

  const updateLabels = useCallback(
    async (nextLabels: AutoAppliedLabel[]): Promise<void> => {
      if (!featureConfigMap) {
        return;
      }

      setUpdateError(null);
      const path = `/data/${AUTO_APPLIED_LABELS}`;
      const operation =
        featureConfigMap.data?.[AUTO_APPLIED_LABELS] === undefined ? 'add' : 'replace';

      try {
        await kubevirtK8sPatch({
          cluster: resolvedCluster,
          data: [{ op: operation, path, value: JSON.stringify(nextLabels) }],
          model: ConfigMapModel,
          resource: featureConfigMap,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setUpdateError(error);
        throw error;
      }
    },
    [featureConfigMap, resolvedCluster],
  );

  return {
    error: updateError ?? (loadError instanceof Error ? loadError : null),
    isAdmin,
    labels,
    loaded: Boolean(loaded),
    updateLabels,
  };
};

export default useAutoAppliedLabels;
