import { useCallback, useMemo } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { DISABLED_INSTANCE_TYPE_FAMILIES } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { type InstanceTypeSeries } from '@kubevirt-utils/resources/instancetype/types';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import {
  addDisabledInstanceTypeFamily,
  isInstanceTypeFamilyVisible,
  parseDisabledInstanceTypeFamilies,
  removeDisabledInstanceTypeFamily,
  serializeDisabledInstanceTypeFamilies,
} from './utils';

type PatchOperation = {
  op: 'add' | 'replace' | 'test';
  path: string;
  value?: unknown;
};

const buildDisabledFamiliesPatchData = (
  featureConfigMap: IoK8sApiCoreV1ConfigMap,
  nextDisabledFamilies: InstanceTypeSeries[],
): PatchOperation[] => {
  const serialized = serializeDisabledInstanceTypeFamilies(nextDisabledFamilies);
  const patchData: PatchOperation[] = [
    {
      op: 'test',
      path: '/metadata/resourceVersion',
      value: featureConfigMap.metadata?.resourceVersion,
    },
  ];

  if (featureConfigMap.data == null) {
    patchData.push({
      op: 'add',
      path: '/data',
      value: { [DISABLED_INSTANCE_TYPE_FAMILIES]: serialized },
    });
    return patchData;
  }

  const hasFamilyKey = DISABLED_INSTANCE_TYPE_FAMILIES in featureConfigMap.data;
  patchData.push({
    op: hasFamilyKey ? 'replace' : 'add',
    path: `/data/${DISABLED_INSTANCE_TYPE_FAMILIES}`,
    value: serialized,
  });
  return patchData;
};

type UseDisabledInstanceTypeFamilies = (clusterOverride?: string) => {
  canEdit: boolean;
  disabledFamilies: ReadonlySet<InstanceTypeSeries>;
  isFamilyVisible: (series: string, preserveFamily?: string) => boolean;
  loaded: boolean;
  setFamilyAvailable: (series: InstanceTypeSeries, available: boolean) => Promise<void>;
};

const useDisabledInstanceTypeFamilies: UseDisabledInstanceTypeFamilies = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const operatorNamespace = operatorNamespaceSignal.value;
  const { canEditFeaturesConfigMap, featuresConfigMapData } = useFeaturesConfigMap(cluster);
  const [featureConfigMap, featureConfigMapLoaded] = featuresConfigMapData;
  const familiesLoaded = Boolean(featureConfigMapLoaded);

  const disabledFamiliesList = useMemo(
    () =>
      parseDisabledInstanceTypeFamilies(featureConfigMap?.data?.[DISABLED_INSTANCE_TYPE_FAMILIES]),
    [featureConfigMap],
  );

  const disabledFamilies = useMemo(() => new Set(disabledFamiliesList), [disabledFamiliesList]);

  const isFamilyVisible = useCallback(
    (series: string, preserveFamily?: string) =>
      isInstanceTypeFamilyVisible(series, disabledFamilies, preserveFamily),
    [disabledFamilies],
  );

  const setFamilyAvailable = useCallback(
    async (series: InstanceTypeSeries, available: boolean): Promise<void> => {
      if (!canEditFeaturesConfigMap) {
        throw new Error('User is not authorized to update instance type family availability');
      }
      if (!operatorNamespace || !featureConfigMap) {
        throw new Error('Features ConfigMap is not available');
      }

      const nextDisabledFamilies: InstanceTypeSeries[] = available
        ? removeDisabledInstanceTypeFamily(disabledFamiliesList, series)
        : addDisabledInstanceTypeFamily(disabledFamiliesList, series);

      await kubevirtK8sPatch({
        cluster,
        data: buildDisabledFamiliesPatchData(featureConfigMap, nextDisabledFamilies),
        model: ConfigMapModel,
        resource: featureConfigMap,
      });
    },
    [canEditFeaturesConfigMap, cluster, disabledFamiliesList, featureConfigMap, operatorNamespace],
  );

  return {
    canEdit: canEditFeaturesConfigMap,
    disabledFamilies,
    isFamilyVisible,
    loaded: familiesLoaded,
    setFamilyAvailable,
  };
};

export default useDisabledInstanceTypeFamilies;
