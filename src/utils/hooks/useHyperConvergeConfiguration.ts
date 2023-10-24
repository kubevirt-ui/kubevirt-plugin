import { useMemo } from 'react';

import { HyperConvergedModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1LabelSelector } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1MigrationConfiguration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export type HyperConverged = K8sResourceCommon & {
  spec: {
    commonTemplatesNamespace?: string;
    configuration?: { ksmConfiguration: { nodeLabelSelector?: Record<string, never> } };
    evictionStrategy?: string;
    liveMigrationConfig: V1MigrationConfiguration;
    resourceRequirements: {
      autoCPULimitNamespaceLabelSelector: V1LabelSelector;
    };
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
  const [hyperConvergeData, hyperConvergeDataLoaded, hyperConvergeDataError] = useK8sWatchResource<
    HyperConverged[]
  >({
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
