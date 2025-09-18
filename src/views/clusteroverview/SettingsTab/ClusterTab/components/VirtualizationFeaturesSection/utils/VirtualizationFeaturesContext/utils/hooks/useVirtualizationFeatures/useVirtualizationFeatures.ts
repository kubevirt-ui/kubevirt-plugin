import { useCallback, useState } from 'react';

import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import useOperatorResources from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/useOperatorResources';
import { OperatorsToInstall } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { getVirtualizationFeatureItems } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/hooks/useVirtualizationFeatures/utils';
import {
  OperatorDetailsMap,
  OperatorResources,
  VirtFeatureOperatorItemsMap,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/types';
import {
  getOperatorData,
  groupOperatorItems,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/utils';
import { defaultOperatorsToInstall } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/utils';

export type VirtualizationFeaturesResources = {
  operatorDetailsMap?: OperatorDetailsMap;
  operatorItemsMap?: VirtFeatureOperatorItemsMap;
  operatorResources?: OperatorResources;
  operatorResourcesLoaded?: boolean;
  operatorsToInstall?: OperatorsToInstall;
  updateInstallRequests?: (updates: OperatorsToInstall) => void;
};

type UseVirtualizationFeatures = () => VirtualizationFeaturesResources;

export const useVirtualizationFeatures: UseVirtualizationFeatures = () => {
  const [operatorsToInstall, setOperatorsToInstall] =
    useState<OperatorsToInstall>(defaultOperatorsToInstall);
  const [activeNamespace] = useActiveNamespace();
  const validNamespace = getValidNamespace(activeNamespace);

  const updateInstallRequests = useCallback((updates: OperatorsToInstall) => {
    setOperatorsToInstall({ ...operatorsToInstall, ...updates });
  }, []);

  const operatorResources = useOperatorResources();
  const { clusterServiceVersions, operatorGroups, operatorResourcesLoaded, subscriptions } =
    operatorResources;

  const virtFeatureOperatorItems = getVirtualizationFeatureItems(operatorResources);
  const operatorItemsMap = groupOperatorItems(virtFeatureOperatorItems);
  const operatorDetailsMap = getOperatorData(operatorItemsMap, operatorsToInstall, validNamespace);

  return {
    operatorDetailsMap,
    operatorItemsMap,
    operatorResources: {
      clusterServiceVersions,
      operatorGroups,
      subscriptions,
    },
    operatorResourcesLoaded,
    operatorsToInstall,
    updateInstallRequests,
  };
};
