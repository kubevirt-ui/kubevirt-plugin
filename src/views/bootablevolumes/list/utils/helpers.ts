import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCluster } from '@multicluster/helpers/selectors';

import { type BootableResource } from '../../utils/types';
import { getPreferenceReadableOS } from '../../utils/utils';

type ClusterCallbacks = {
  clusterParam?: string | null;
  preferences: V1beta1VirtualMachineClusterPreference[];
};

export const getEffectiveCluster = (row: BootableResource, callbacks: ClusterCallbacks): string =>
  getCluster(row) || callbacks.clusterParam;

export const getClusterPreferences = (
  cluster: string | null | undefined,
  preferences: V1beta1VirtualMachineClusterPreference[],
): V1beta1VirtualMachineClusterPreference[] =>
  preferences.filter((preference) => getCluster(preference) === cluster);

export const getBootableVolumeOSDisplayValue = (
  row: BootableResource,
  callbacks?: ClusterCallbacks,
): string => {
  const cluster = callbacks ? getEffectiveCluster(row, callbacks) : getCluster(row);
  const clusterPreferences = getClusterPreferences(cluster, callbacks?.preferences ?? []);

  return getPreferenceReadableOS(row, clusterPreferences, cluster);
};
