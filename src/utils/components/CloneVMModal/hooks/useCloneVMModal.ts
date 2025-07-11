import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineCloneModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineCloneModel';
import { V1beta1VirtualMachineClone } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseCloneVMModal = (
  cloneRequestName: string,
  cloneRequestNamespace: string,
  cluster?: string,
) => V1beta1VirtualMachineClone;

const useCloneVMModal: UseCloneVMModal = (cloneRequestName, cloneRequestNamespace, cluster) => {
  const [freshVMCloneRequest] = useK8sWatchData<V1beta1VirtualMachineClone>(
    cloneRequestName &&
      cloneRequestNamespace && {
        cluster,
        groupVersionKind: modelToGroupVersionKind(VirtualMachineCloneModel),
        name: cloneRequestName,
        namespace: cloneRequestNamespace,
      },
  );

  return freshVMCloneRequest;
};

export default useCloneVMModal;
