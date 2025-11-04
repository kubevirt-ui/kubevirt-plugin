import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterPreferences = (
  fieldSelector?: string,
  selector?: Selector,
  cluster?: string,
) => [preferences: V1beta1VirtualMachineClusterPreference[], loaded: boolean, loadError: Error];

const useClusterPreferences: UseClusterPreferences = (fieldSelector, selector, cluster) => {
  const clusterParam = useClusterParam();
  const multiclusterFilters = useListMulticlusterFilters();

  const [preferences, loaded, loadError] = useKubevirtWatchResource<
    V1beta1VirtualMachineClusterPreference[]
  >(
    {
      cluster: cluster || clusterParam,
      fieldSelector,
      groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
      isList: true,
      selector,
    },
    null,
    multiclusterFilters,
  );

  return [preferences || [], loaded || !!loadError, loadError];
};

export default useClusterPreferences;
