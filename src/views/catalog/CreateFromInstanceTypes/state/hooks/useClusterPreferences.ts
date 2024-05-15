import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Selector, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterPreferences = (
  fieldSelector?: string,
  selector?: Selector,
) => [preferences: V1beta1VirtualMachineClusterPreference[], loaded: boolean, loadError: Error];

const useClusterPreferences: UseClusterPreferences = (fieldSelector, selector) => {
  const [preferences, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineClusterPreference[]
  >({
    fieldSelector,
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
    selector,
  });

  return [preferences || [], loaded || !!loadError, loadError];
};

export default useClusterPreferences;
