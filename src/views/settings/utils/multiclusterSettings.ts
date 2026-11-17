import { PERSPECTIVES } from '@kubevirt-utils/constants/constants';

export const isFleetSettingsContext = (
  perspective: string | undefined,
  isFleetPath: boolean,
): boolean => isFleetPath || perspective === PERSPECTIVES.FLEET_VIRTUALIZATION;

export const shouldShowMulticlusterSettingsUI = (
  perspective: string | undefined,
  clusterCount: number,
  isFleetPath = false,
): boolean => isFleetSettingsContext(perspective, isFleetPath) && clusterCount > 1;

export const shouldWaitForFleetClusters = (
  perspective: string | undefined,
  clustersLoaded: boolean,
  isFleetPath = false,
): boolean => isFleetSettingsContext(perspective, isFleetPath) && !clustersLoaded;

export const resolveSettingsContextCluster = (
  showMulticlusterSettings: boolean,
  selectedCluster: string | undefined,
  hubClusterName: string | undefined,
): string | undefined => {
  if (!showMulticlusterSettings) {
    return undefined;
  }

  const activeCluster = selectedCluster ?? hubClusterName;
  if (!activeCluster || activeCluster === hubClusterName) {
    return undefined;
  }

  return activeCluster;
};
