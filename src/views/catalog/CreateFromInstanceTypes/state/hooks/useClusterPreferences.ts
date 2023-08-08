import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterPreferences = () => [
  preferences: V1beta1VirtualMachineClusterPreference[],
  loaded: boolean,
  loadError: Error,
];

const useClusterPreferences: UseClusterPreferences = () => {
  const [preferences, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineClusterPreference[]
  >({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
  });

  return [preferences || [], loaded || !!loadError, loadError];
};

export default useClusterPreferences;
