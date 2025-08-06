import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isAllNamespaces } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseVirtualMachineInstanceTypes = (params?: {
  fieldSelector?: string;
  namespace?: string;
  selector?: Selector;
}) => [instanceTypes: V1beta1VirtualMachineInstancetype[], loaded: boolean, loadError: Error];

const useVirtualMachineInstanceTypes: UseVirtualMachineInstanceTypes = ({
  fieldSelector,
  namespace,
  selector,
}) => {
  const cluster = useClusterParam();
  const isAllNamespace = isAllNamespaces(namespace);

  const [instanceTypes, loaded, loadError] = useK8sWatchData<V1beta1VirtualMachineInstancetype[]>({
    cluster,
    fieldSelector,
    groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
    isList: true,
    selector,
    ...(!isAllNamespace && { namespace }),
  });

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useVirtualMachineInstanceTypes;
