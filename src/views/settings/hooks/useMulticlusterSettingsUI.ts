import { useCallback, useState } from 'react';

import { useActivePerspective } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

import {
  isFleetSettingsContext,
  resolveSettingsContextCluster,
  shouldShowMulticlusterSettingsUI,
  shouldWaitForFleetClusters,
} from '../utils/multiclusterSettings';

type UseMulticlusterSettingsUI = {
  activeCluster: string | undefined;
  contextCluster: string | undefined;
  isFleetSettings: boolean;
  onClusterChange: (cluster: string) => void;
  showMulticlusterSettings: boolean;
  waitForFleetClusters: boolean;
};

const useMulticlusterSettingsUI = (isFleetPath: boolean): UseMulticlusterSettingsUI => {
  const [perspective] = useActivePerspective();
  const [clusterNames, clustersLoaded] = useFleetClusterNames();
  const [hubClusterName] = useHubClusterName();
  const [selectedCluster, setSelectedCluster] = useState<string>();

  const isFleetSettings = isFleetSettingsContext(perspective, isFleetPath);
  const showMulticlusterSettings = shouldShowMulticlusterSettingsUI(
    perspective,
    clusterNames?.length ?? 0,
    isFleetPath,
  );
  const contextCluster = resolveSettingsContextCluster(
    showMulticlusterSettings,
    selectedCluster,
    hubClusterName,
  );

  const onClusterChange = useCallback((cluster: string) => {
    setSelectedCluster(cluster);
  }, []);

  return {
    activeCluster: showMulticlusterSettings ? (selectedCluster ?? hubClusterName) : undefined,
    contextCluster,
    isFleetSettings,
    onClusterChange,
    showMulticlusterSettings,
    waitForFleetClusters: shouldWaitForFleetClusters(
      perspective,
      Boolean(clustersLoaded),
      isFleetPath,
    ),
  };
};

export default useMulticlusterSettingsUI;
