import {
  modelToGroupVersionKind,
  VirtualMachineCloneModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1VirtualMachineClone } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useCloneVMModal = (
  cloneRequestName: string,
  cloneRequestNamespace: string,
  cluster?: string,
): V1beta1VirtualMachineClone => {
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
