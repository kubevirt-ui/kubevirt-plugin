import { useCallback } from 'react';

import { ConsoleOperatorConfigModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { useAccessReview, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import useVirtualizationOperators from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/useVirtualizationOperators';
import { VirtFeatureOperatorItem } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/utils/types';
import { OperatorsToInstall } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { CONSOLE_OPERATOR_CONFIG_NAME } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/constants';
import { createOperator } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/createOperator';
import { CreateOperatorResources } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/types';
import { useCreateOperatorResources } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/utils';

const useCreateOperator = () => {
  const { operatorItemsMap } = useVirtualizationOperators();
  const data = useK8sWatchResources<CreateOperatorResources>(useCreateOperatorResources);

  const [canPatchConsoleOperatorConfig] = useAccessReview({
    group: ConsoleOperatorConfigModel.apiGroup,
    name: CONSOLE_OPERATOR_CONFIG_NAME,
    resource: ConsoleOperatorConfigModel.plural,
    verb: 'patch',
  });

  const operatorGroups = data?.operatorGroups?.data;
  const subscriptions = data?.subscriptions?.data;
  const namespaces = data?.namespaces?.data;
  const consoleOperatorConfig = data?.consoleOperatorConfig?.data;

  const namespaceNames = namespaces?.map((ns) => getName(ns));

  const createOperatorCallback = useCallback(
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

  const loaded = Object.keys(data)?.every((key) => data?.[key]?.loaded);

  return { createOperators: createOperatorCallback, loaded };
};

export default useCreateOperator;
