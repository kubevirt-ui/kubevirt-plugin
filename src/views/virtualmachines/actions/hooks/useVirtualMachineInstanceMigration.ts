import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useVirtualMachineInstanceMigration = (name: string, namespace: string) => {
  const [vmims] = useK8sWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    namespace,
    name: `${name}-migration`,
  });

  // since migration objects are kepts until VMI is deleted
  // we will need to find the one which is related to VMI and is not copmleted.

  const latestVMIM = vmims?.reduce((acc, vmim) => {
    const creationTime = new Date(vmim?.metadata?.creationTimestamp).getTime();
    if (!acc || creationTime > new Date(acc?.metadata?.creationTimestamp).getTime()) {
      return vmim;
    }
    return acc;
  }, null);
  return latestVMIM;
};

export default useVirtualMachineInstanceMigration;
