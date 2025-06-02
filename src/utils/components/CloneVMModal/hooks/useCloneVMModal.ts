import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineCloneModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineCloneModel';
import { V1beta1VirtualMachineClone } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseCloneVMModal = (
  cloneRequestName: string,
  cloneRequestNamespace: string,
) => V1beta1VirtualMachineClone;

const useCloneVMModal: UseCloneVMModal = (cloneRequestName, cloneRequestNamespace) => {
  const [freshVMCloneRequest] = useK8sWatchResource<V1beta1VirtualMachineClone>(
    cloneRequestName &&
      cloneRequestNamespace && {
        groupVersionKind: modelToGroupVersionKind(VirtualMachineCloneModel),
        name: cloneRequestName,
        namespace: cloneRequestNamespace,
      },
  );

  return freshVMCloneRequest;
};

export default useCloneVMModal;
