import { useMemo } from 'react';

import { ConsoleOperatorConfigModel, NamespaceModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import {
  getGroupVersionKindForModel,
  K8sResourceKind,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { CONSOLE_OPERATOR_CONFIG_NAME } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/constants';

type UseInstallResourcesReturn = {
  canPatchConsoleOperatorConfig: boolean;
  consoleOperatorConfig: K8sResourceKind;
  installResourcesLoaded: boolean;
  namespaceNames: string[];
};

const useInstallResources = (): UseInstallResourcesReturn => {
  const cluster = useSettingsCluster();

  const watchedResources = useMemo(
    () => ({
      consoleOperatorConfig: {
        cluster,
        groupVersionKind: getGroupVersionKindForModel(ConsoleOperatorConfigModel),
        isList: false,
        name: CONSOLE_OPERATOR_CONFIG_NAME,
      },
      namespaces: {
        cluster,
        groupVersionKind: getGroupVersionKindForModel(NamespaceModel),
        isList: true,
      },
    }),
    [cluster],
  );

  const watchData = useKubevirtWatchResources<{
    consoleOperatorConfig: K8sResourceKind;
    namespaces: K8sResourceKind[];
  }>(watchedResources);

  const consoleOperatorConfig = watchData?.consoleOperatorConfig?.data as K8sResourceKind;
  const namespaces = (watchData?.namespaces?.data as K8sResourceKind[]) ?? [];
  const namespaceNames = useMemo(() => namespaces.map(getName), [namespaces]);

  const installResourcesLoaded =
    watchData?.consoleOperatorConfig?.loaded && watchData?.namespaces?.loaded;

  const [canPatchConsoleOperatorConfig] = useAccessReview({
    group: ConsoleOperatorConfigModel.apiGroup,
    name: CONSOLE_OPERATOR_CONFIG_NAME,
    resource: ConsoleOperatorConfigModel.plural,
    verb: 'patch',
  });

  return {
    canPatchConsoleOperatorConfig,
    consoleOperatorConfig,
    installResourcesLoaded,
    namespaceNames,
  };
};

export default useInstallResources;
