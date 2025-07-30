import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Selector, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

type UseVirtualMachineInstanceTypes = (
  fieldSelector?: string,
  selector?: Selector,
  fetchAllProjects?: boolean,
) => [instanceTypes: V1beta1VirtualMachineInstancetype[], loaded: boolean, loadError: Error];

const useVirtualMachineInstanceTypes: UseVirtualMachineInstanceTypes = (
  fieldSelector,
  selector,
  fetchAllProjects,
) => {
  const [activeNamespace] = useActiveNamespace();
  const cluster = useClusterParam();
  const isAllNamespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY;
  const [instanceTypes, loaded, loadError] = useK8sWatchData<V1beta1VirtualMachineInstancetype[]>(
    (fetchAllProjects || !isAllNamespace) && {
      cluster,
      fieldSelector,
      groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
      isList: true,
      selector,
      ...(!isAllNamespace && { namespace: activeNamespace }),
    },
  );

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useVirtualMachineInstanceTypes;
