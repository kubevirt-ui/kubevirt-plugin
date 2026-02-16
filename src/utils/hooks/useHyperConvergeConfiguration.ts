import { useMemo } from 'react';

import { HyperConvergedModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1LabelSelector } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1MigrationConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import { DEFAULT_OPERATOR_NAMESPACE, isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import useDeepCompareMemoize from './useDeepCompareMemoize/useDeepCompareMemoize';

export type HyperConverged = K8sResourceCommon & {
  spec: {
    applicationAwareConfig?: {
      allowApplicationAwareClusterResourceQuota?: boolean;
      vmiCalcConfigName?: CalculationMethod;
    };
    commonBootImageNamespace?: string;
    commonTemplatesNamespace?: string;
    dataImportCronTemplates: K8sResourceCommon[];
    enableApplicationAwareQuota?: boolean;
    enableCommonBootImageImport?: boolean;
    evictionStrategy?: string;
    featureGates: {
      autoResourceLimits?: boolean;
      deployKubeSecondaryDNS?: boolean;
      deployTektonTaskResources?: boolean;
      disableMDevConfiguration?: boolean;
      enableCommonBootImageImport?: boolean;
      enableMultiArchBootImageImport?: boolean;
      nonRoot?: boolean;
      persistentReservation?: boolean;
      root?: boolean;
      withHostPassthroughCPU?: boolean;
    };
    higherWorkloadDensity: { memoryOvercommitPercentage: number };
    ksmConfiguration: { nodeLabelSelector?: Record<string, never> };
    liveMigrationConfig: V1MigrationConfiguration;
    resourceRequirements: {
      autoCPULimitNamespaceLabelSelector: V1LabelSelector;
    };
    virtualMachineOptions: { disableSerialConsoleLog: string };
  };
  status: {
    dataImportCronTemplates: K8sResourceCommon[];
    nodeInfo: {
      workloadsArchitectures: string[];
    };
  };
};

const getHyperConvergedObject = (hyperConverged): HyperConverged => {
  if (isEmpty(hyperConverged)) return null;
  if (hyperConverged?.items) return hyperConverged?.items?.[0];
  if (Array.isArray(hyperConverged)) return hyperConverged?.[0];
  return hyperConverged;
};

type UseHyperConvergeConfigurationType = (
  cluster?: string,
) => [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];

const useHyperConvergeConfiguration: UseHyperConvergeConfigurationType = (cluster) => {
  const [hyperConvergeData, hyperConvergeDataLoaded, hyperConvergeDataError] = useK8sWatchData<
    HyperConverged[]
  >({
    cluster,
    groupVersionKind: HyperConvergedModelGroupVersionKind,
    isList: true,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
  });

  const hyperConverge = useMemo(
    () => getHyperConvergedObject(hyperConvergeData),
    [hyperConvergeData],
  );

  const memoizedHyperconvergedConfig = useDeepCompareMemoize(hyperConverge);

  return [memoizedHyperconvergedConfig, hyperConvergeDataLoaded, hyperConvergeDataError];
};

export default useHyperConvergeConfiguration;
