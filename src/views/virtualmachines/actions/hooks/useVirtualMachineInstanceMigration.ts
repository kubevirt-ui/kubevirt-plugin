import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useVirtualMachineInstanceMigration = (resource: K8sResourceCommon) => {
  const [vmims] = useK8sWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    name: `${resource?.metadata?.name}-migration`,
    namespace: resource?.metadata?.namespace,
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
