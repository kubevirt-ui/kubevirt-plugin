import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import {
  Selector,
  useActiveNamespace,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

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
  const isAllNamespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY;
  const [instanceTypes, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineInstancetype[]
  >(
    (fetchAllProjects || !isAllNamespace) && {
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
