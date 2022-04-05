import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { VirtualMachineInstanceMigrationModel } from '../actions';

const useVirtualMachineInstanceMigration = (vm: V1VirtualMachine) => {
  const [vmims] = useK8sWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: modelToGroupVersionKind(VirtualMachineInstanceMigrationModel),
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
