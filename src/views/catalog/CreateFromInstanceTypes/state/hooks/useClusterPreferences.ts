import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterPreferences = (
  fieldSelector?: string,
  selector?: Selector,
) => [preferences: V1beta1VirtualMachineClusterPreference[], loaded: boolean, loadError: Error];

const useClusterPreferences: UseClusterPreferences = (fieldSelector, selector) => {
  const cluster = useClusterParam();
  const [preferences, loaded, loadError] = useK8sWatchData<
    V1beta1VirtualMachineClusterPreference[]
  >({
    cluster,
    fieldSelector,
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
    selector,
  });

  return [preferences || [], loaded || !!loadError, loadError];
};

export default useClusterPreferences;
