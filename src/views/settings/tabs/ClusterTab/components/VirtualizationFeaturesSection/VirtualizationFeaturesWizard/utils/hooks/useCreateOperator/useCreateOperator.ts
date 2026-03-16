import { useCallback, useEffect, useMemo, useRef } from 'react';

import { ConsoleOperatorConfigModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { OperatorsToInstall } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { VirtFeatureOperatorItem } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/types';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import { CONSOLE_OPERATOR_CONFIG_NAME } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/constants';
import { createOperator } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/createOperator';
import { CreateOperatorResources } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/types';
import { getCreateOperatorWatchedResources } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/utils';

type UseCreateOperator = () => {
  createOperatorsResourcesLoaded: boolean;
};

const useCreateOperator: UseCreateOperator = () => {
  const cluster = useSettingsCluster();
  const {
    operatorDetailsMap,
    operatorItemsMap,
    operatorResources,
    operatorResourcesLoaded,
    operatorsToInstall,
  } = useVirtualizationFeaturesContext();
  const resources = useMemo(() => getCreateOperatorWatchedResources(cluster), [cluster]);
  const data = useKubevirtWatchResources<CreateOperatorResources>(resources);

  const [canPatchConsoleOperatorConfig] = useAccessReview({
    group: ConsoleOperatorConfigModel.apiGroup,
    name: CONSOLE_OPERATOR_CONFIG_NAME,
    resource: ConsoleOperatorConfigModel.plural,
    verb: 'patch',
  });

  const { operatorGroups, subscriptions } = operatorResources ?? {};
  const consoleOperatorConfig = data?.consoleOperatorConfig?.data;
  const namespaces = data?.namespaces?.data;

  const namespaceNames = namespaces?.map((ns) => getName(ns));

  const createOperators = useCallback(
    (toInstall: OperatorsToInstall) => {
      Object.entries(toInstall)?.forEach(([operatorName, installOperator]) => {
        if (!installOperator) return;

        const operatorItem: VirtFeatureOperatorItem = operatorItemsMap?.[operatorName]?.[0];
        if (!operatorItem) return;

        createOperator(
          operatorItem,
          consoleOperatorConfig,
          canPatchConsoleOperatorConfig,
          namespaceNames,
          operatorGroups,
          subscriptions,
          cluster,
        ).catch((err) => kubevirtConsole.error(err));
      });
    },
    [
      namespaceNames,
      consoleOperatorConfig,
      subscriptions,
      operatorGroups,
      canPatchConsoleOperatorConfig,
      cluster,
      operatorItemsMap,
    ],
  );

  const createOperatorsResourcesLoaded =
    Object.keys(data)?.every((key) => data?.[key]?.loaded) && operatorResourcesLoaded;

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (
      hasSubmittedRef.current ||
      !operatorResourcesLoaded ||
      !createOperatorsResourcesLoaded ||
      isEmpty(operatorDetailsMap)
    ) {
      return;
    }

    hasSubmittedRef.current = true;
    createOperators(operatorsToInstall);
  }, [
    createOperators,
    createOperatorsResourcesLoaded,
    operatorDetailsMap,
    operatorResourcesLoaded,
    operatorsToInstall,
  ]);

  return { createOperatorsResourcesLoaded };
};

export default useCreateOperator;
