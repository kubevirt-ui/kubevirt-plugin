import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseUserInstanceTypes = () => [
  instanceTypes: V1beta1VirtualMachineInstancetype[],
  loaded: boolean,
  loadError: Error,
];

const useUserInstanceTypes: UseUserInstanceTypes = () => {
  const [activeNamespace] = useActiveNamespace();
  const [instanceTypes, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineInstancetype[]
  >(
    activeNamespace !== ALL_NAMESPACES_SESSION_KEY && {
      groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
      isList: true,
      namespace: activeNamespace,
    },
  );

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useUserInstanceTypes;
