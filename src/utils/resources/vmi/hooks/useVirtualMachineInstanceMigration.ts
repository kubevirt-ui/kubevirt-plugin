import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { MIGRATION_VMI_NAME_LABEL } from '@kubevirt-utils/resources/vmim/constants';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useVirtualMachineInstanceMigration = (resource: K8sResourceCommon) => {
  const [vmims] = useK8sWatchData<V1VirtualMachineInstanceMigration[]>(
    resource && {
      cluster: resource?.cluster,
      groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
      isList: true,
      namespace: resource?.metadata?.namespace,
      selector: {
        matchLabels: {
          [MIGRATION_VMI_NAME_LABEL]: resource?.metadata?.name,
        },
      },
    },
  );

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
