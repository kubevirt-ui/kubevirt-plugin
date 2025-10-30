import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseVirtualMachineInstanceTypes = (params?: {
  cluster?: string;
  fieldSelector?: string;
  namespace?: string;
  selector?: Selector;
}) => [instanceTypes: V1beta1VirtualMachineInstancetype[], loaded: boolean, loadError: Error];

const useVirtualMachineInstanceTypes: UseVirtualMachineInstanceTypes = ({
  cluster,
  fieldSelector,
  namespace,
  selector,
}) => {
  const clusterParam = useClusterParam();
  const multiclusterFilters = useListMulticlusterFilters();
  const isAllNamespace = isAllNamespaces(namespace);

  const [instanceTypes, loaded, loadError] = useKubevirtWatchResource<
    V1beta1VirtualMachineInstancetype[]
  >(
    {
      cluster: cluster || clusterParam,
      fieldSelector,
      groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
      isList: true,
      selector,
      ...(!isAllNamespace && { namespace }),
    },
    null,
    multiclusterFilters,
  );

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useVirtualMachineInstanceTypes;
