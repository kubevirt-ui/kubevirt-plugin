import { useRef } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useVirtualMachineInstanceMigration from '@kubevirt-utils/resources/vmi/hooks/useVirtualMachineInstanceMigration';

const useCurrentStorageMigration = (vm: V1VirtualMachine) => {
  const migrationStartedTime = useRef(new Date());
  const vmim = useVirtualMachineInstanceMigration(vm);

  const isCurrentStorageMigration =
    migrationStartedTime.current < new Date(vmim?.metadata?.creationTimestamp);

  return isCurrentStorageMigration ? vmim : null;
};

export default useCurrentStorageMigration;
