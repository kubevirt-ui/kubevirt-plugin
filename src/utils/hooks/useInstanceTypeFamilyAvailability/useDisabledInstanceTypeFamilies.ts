import { useCallback } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useCanPatchFeaturesConfigMap from '@kubevirt-utils/hooks/useCanPatchFeaturesConfigMap';
import { DISABLED_INSTANCE_TYPE_FAMILIES } from '@kubevirt-utils/hooks/useFeatures/constants';
import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import useDisabledInstanceTypeFamiliesData from './useDisabledInstanceTypeFamiliesData';
import {
  addDisabledInstanceTypeFamily,
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
  nextDisabledFamilies: InstanceTypeSeriesName[],
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
  canEditLoaded: boolean;
  disabledFamilies: ReadonlySet<InstanceTypeSeriesName>;
  isFamilyVisible: (series: string, preserveFamily?: string) => boolean;
  loaded: boolean;
  setFamilyAvailable: (series: InstanceTypeSeriesName, available: boolean) => Promise<void>;
};

const useDisabledInstanceTypeFamilies: UseDisabledInstanceTypeFamilies = (clusterOverride) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const operatorNamespace = operatorNamespaceSignal.value;
  const [canEdit, canEditLoading] = useCanPatchFeaturesConfigMap(cluster);
  const { disabledFamilies, disabledFamiliesList, featureConfigMap, isFamilyVisible, loaded } =
    useDisabledInstanceTypeFamiliesData(cluster);

  const setFamilyAvailable = useCallback(
    async (series: InstanceTypeSeriesName, available: boolean): Promise<void> => {
      if (!canEdit) {
        throw new Error('User is not authorized to update instance type family availability');
      }
      if (!operatorNamespace || !featureConfigMap) {
        throw new Error('Features ConfigMap is not available');
      }

      const nextDisabledFamilies: InstanceTypeSeriesName[] = available
        ? removeDisabledInstanceTypeFamily(disabledFamiliesList, series)
        : addDisabledInstanceTypeFamily(disabledFamiliesList, series);

      await kubevirtK8sPatch({
        cluster,
        data: buildDisabledFamiliesPatchData(featureConfigMap, nextDisabledFamilies),
        model: ConfigMapModel,
        resource: featureConfigMap,
      });
    },
    [canEdit, cluster, disabledFamiliesList, featureConfigMap, operatorNamespace],
  );

  return {
    canEdit,
    canEditLoaded: !canEditLoading,
    disabledFamilies,
    isFamilyVisible,
    loaded,
    setFamilyAvailable,
  };
};

export default useDisabledInstanceTypeFamilies;
