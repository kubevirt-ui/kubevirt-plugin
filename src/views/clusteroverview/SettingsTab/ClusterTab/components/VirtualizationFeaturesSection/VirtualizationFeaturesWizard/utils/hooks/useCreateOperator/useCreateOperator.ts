import { useCallback } from 'react';

import { ConsoleOperatorConfigModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useAccessReview, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { OperatorsToInstall } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { VirtFeatureOperatorItem } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/types';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import { CONSOLE_OPERATOR_CONFIG_NAME } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/constants';
import { createOperator } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/createOperator';
import { CreateOperatorResources } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/types';
import { createOperatorWatchedResources } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/utils';

type UseCreateOperator = () => {
  createOperators: (operatorsToInstall: OperatorsToInstall) => void;
  createOperatorsResourcesLoaded: boolean;
};

const useCreateOperator: UseCreateOperator = () => {
  const { operatorItemsMap, operatorResources, operatorResourcesLoaded } =
    useVirtualizationFeaturesContext();
  const data = useK8sWatchResources<CreateOperatorResources>(createOperatorWatchedResources);

  const [canPatchConsoleOperatorConfig] = useAccessReview({
    group: ConsoleOperatorConfigModel.apiGroup,
    name: CONSOLE_OPERATOR_CONFIG_NAME,
    resource: ConsoleOperatorConfigModel.plural,
    verb: 'patch',
  });

  const { operatorGroups, subscriptions } = operatorResources;
  const consoleOperatorConfig = data?.consoleOperatorConfig?.data;
  const namespaces = data?.namespaces?.data;

  const namespaceNames = namespaces?.map((ns) => getName(ns));

  const createOperators = useCallback(
    (operatorsToInstall: OperatorsToInstall) => {
      Object.entries(operatorsToInstall)?.forEach(([operatorName, installOperator]) => {
        if (!installOperator) return;

        const operatorItem: VirtFeatureOperatorItem = operatorItemsMap?.[operatorName]?.[0];
        createOperator(
          operatorItem,
          consoleOperatorConfig,
          canPatchConsoleOperatorConfig,
          namespaceNames,
          operatorGroups,
          subscriptions,
        ).catch((err) => kubevirtConsole.error(err));
      });
    },
    [
      namespaceNames,
      consoleOperatorConfig,
      subscriptions,
      operatorGroups,
      canPatchConsoleOperatorConfig,
    ],
  );

  const createOperatorsResourcesLoaded =
    Object.keys(data)?.every((key) => data?.[key]?.loaded) && operatorResourcesLoaded;

  return { createOperators, createOperatorsResourcesLoaded };
};

export default useCreateOperator;
