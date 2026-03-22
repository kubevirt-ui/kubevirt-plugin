import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCluster } from '@multicluster/helpers/selectors';

import { BootableResource } from '../../utils/types';
import { BootableVolumeCallbacks } from '../bootableVolumesDefinition';

export const getEffectiveCluster = (
  row: BootableResource,
  callbacks: BootableVolumeCallbacks,
): string => getCluster(row) || callbacks.clusterParam;

export const getClusterPreferences = (
  cluster: string,
  preferences: V1beta1VirtualMachineClusterPreference[],
): V1beta1VirtualMachineClusterPreference[] =>
  preferences.filter((preference) => getCluster(preference) === cluster);
