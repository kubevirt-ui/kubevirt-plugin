import { useMemo } from 'react';

import { HyperConvergedModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1LabelSelector } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1MigrationConfiguration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtWatchResource from './useKubevirtWatchResource/useKubevirtWatchResource';

export type HyperConverged = K8sResourceCommon & {
  spec: {
    commonBootImageNamespace?: string;
    commonTemplatesNamespace?: string;
    dataImportCronTemplates: K8sResourceCommon[];
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

type UseHyperConvergeConfigurationType = (cluster?: string) => [
  hyperConvergeConfig: HyperConverged,
  loaded: boolean,
  error: any,
];

const useHyperConvergeConfiguration: UseHyperConvergeConfigurationType = (cluster) => {
  const [hyperConvergeData, hyperConvergeDataLoaded, hyperConvergeDataError] = useKubevirtWatchResource<
    HyperConverged[]
  >({
    cluster,
    groupVersionKind: HyperConvergedModelGroupVersionKind,
    isList: true,
  });

  const hyperConverge = useMemo(
    () => getHyperConvergedObject(hyperConvergeData),
    [hyperConvergeData],
  );

  return [hyperConverge, hyperConvergeDataLoaded, hyperConvergeDataError];
};

export default useHyperConvergeConfiguration;
