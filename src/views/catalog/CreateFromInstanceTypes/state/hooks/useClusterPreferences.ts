import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterPreferences = (
  fieldSelector?: string,
  selector?: Selector,
) => [preferences: V1beta1VirtualMachineClusterPreference[], loaded: boolean, loadError: Error];

const useClusterPreferences: UseClusterPreferences = (fieldSelector, selector) => {
  const cluster = useClusterParam();
  const [preferences, loaded, loadError] = useKubevirtWatchResource<
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
