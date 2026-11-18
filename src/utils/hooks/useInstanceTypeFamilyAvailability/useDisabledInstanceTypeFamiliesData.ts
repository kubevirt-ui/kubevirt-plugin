// @ai-rules:
// 1. [Pattern]: Read-only watch of the `kubevirt-ui-features` ConfigMap. Must NOT perform access reviews,
//    so it is safe to call once per table row (see FamilyStatusCell).
// 2. [Pattern]: `useDisabledInstanceTypeFamilies` composes this hook with the RBAC check and patch logic.
import { useCallback, useMemo } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  DISABLED_INSTANCE_TYPE_FAMILIES,
  FEATURES_CONFIG_MAP_NAME,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { type InstanceTypeSeriesName } from '@kubevirt-utils/resources/instancetype/types';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';

import { isInstanceTypeFamilyVisible, parseDisabledInstanceTypeFamilies } from './utils';

type UseDisabledInstanceTypeFamiliesData = (clusterOverride?: string) => {
  disabledFamilies: ReadonlySet<InstanceTypeSeriesName>;
  disabledFamiliesList: InstanceTypeSeriesName[];
  featureConfigMap: IoK8sApiCoreV1ConfigMap;
  isFamilyVisible: (series: string, preserveFamily?: string) => boolean;
  loaded: boolean;
};

const useDisabledInstanceTypeFamiliesData: UseDisabledInstanceTypeFamiliesData = (
  clusterOverride,
) => {
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const operatorNamespace = operatorNamespaceSignal.value;

  const [featureConfigMap, featureConfigMapLoaded] = useK8sWatchData<IoK8sApiCoreV1ConfigMap>(
    operatorNamespace && {
      cluster,
      groupVersionKind: getGroupVersionKindForModel(ConfigMapModel),
      isList: false,
      name: FEATURES_CONFIG_MAP_NAME,
      namespace: operatorNamespace,
    },
  );

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

  return {
    disabledFamilies,
    disabledFamiliesList,
    featureConfigMap,
    isFamilyVisible,
    loaded: Boolean(featureConfigMapLoaded),
  };
};

export default useDisabledInstanceTypeFamiliesData;
