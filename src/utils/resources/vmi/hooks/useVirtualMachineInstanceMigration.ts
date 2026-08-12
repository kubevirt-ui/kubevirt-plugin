import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { MIGRATION_VMI_NAME_LABEL } from '@kubevirt-utils/resources/vmim/constants';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useVirtualMachineInstanceMigration = (resource: K8sResourceCommon) => {
  // `resource` starts as `{}` while loading -- both fields are required, or an unscoped watch
  // (missing namespace) or an undefined selector value (missing name) could slip through.
  const namespace = resource?.metadata?.namespace;
  const name = resource?.metadata?.name;

  const [vmims] = useK8sWatchResource<V1VirtualMachineInstanceMigration[]>(
    namespace &&
      name && {
        groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
        isList: true,
        namespace,
        selector: {
          matchLabels: {
            [MIGRATION_VMI_NAME_LABEL]: name,
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
