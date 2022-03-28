import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useVirtualMachineInstanceMigration = (vm: V1VirtualMachine) => {
  const [vmims] = useK8sWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: {
      version: 'v1',
      kind: 'VirtualMachineInstanceMigration',
      group: 'kubevirt.io',
    },
    isList: true,
    namespace: vm?.metadata?.namespace,
    name: `${vm?.metadata?.name}-migration`,
  });

  // since migration objects are kepts until VMI is deleted
  // we will need to find the one which is related to VMI and is not copmleted.

  const obj = vmims?.find(
    (vmim) => vmim?.status?.phase !== 'Succeeded' && vmim?.spec?.vmiName === vm?.metadata?.name,
  );
  return obj;
};

export default useVirtualMachineInstanceMigration;
