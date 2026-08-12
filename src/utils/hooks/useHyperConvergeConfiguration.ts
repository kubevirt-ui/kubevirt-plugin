import { useMemo } from 'react';

import { HyperConvergedModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import { V1LabelSelector } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1MigrationConfiguration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_OPERATOR_NAMESPACE, isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

export type HyperConverged = K8sResourceCommon & {
  spec: {
    commonBootImageNamespace?: string;
    commonTemplatesNamespace?: string;
    dataImportCronTemplates: K8sResourceCommon[];
    evictionStrategy?: string;
    featureGates: {
      deployKubeSecondaryDNS?: boolean;
      deployTektonTaskResources?: boolean;
      disableMDevConfiguration?: boolean;
      enableCommonBootImageImport?: boolean;
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
  };
};

const getHyperConvergedObject = (hyperConverged): HyperConverged => {
  if (isEmpty(hyperConverged)) return null;
  if (hyperConverged?.items) return hyperConverged?.items?.[0];
  if (Array.isArray(hyperConverged)) return hyperConverged?.[0];
  return hyperConverged;
};

type UseHyperConvergeConfigurationType = () => [
  hyperConvergeConfig: HyperConverged,
  loaded: boolean,
  error: any,
];

const useHyperConvergeConfiguration: UseHyperConvergeConfigurationType = () => {
  // Scoped to DEFAULT_OPERATOR_NAMESPACE (was cluster-wide) and gated on `watch`, which
  // non-admins are rarely granted.
  const [canWatchHyperConverged, canWatchHyperConvergedLoading] = useAccessReview({
    group: HyperConvergedModelGroupVersionKind.group,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
    resource: HyperConvergedModel.plural,
    verb: 'watch' as K8sVerb,
  });

  const [hyperConvergeData, hyperConvergeDataLoaded, hyperConvergeDataError] = useK8sWatchResource<
    HyperConverged[]
  >(
    canWatchHyperConverged && {
      groupVersionKind: HyperConvergedModelGroupVersionKind,
      isList: true,
      namespace: DEFAULT_OPERATOR_NAMESPACE,
    },
  );

  const hyperConverge = useMemo(
    () => getHyperConvergedObject(hyperConvergeData),
    [hyperConvergeData],
  );

  if (canWatchHyperConvergedLoading) {
    return [undefined, false, null];
  }

  if (!canWatchHyperConverged) {
    // Non-null so consumers already guarding on it don't treat "denied" as "cluster default".
    return [undefined, true, new Error('User cannot watch HyperConverged resources')];
  }

  return [hyperConverge, hyperConvergeDataLoaded, hyperConvergeDataError];
};

export default useHyperConvergeConfiguration;
