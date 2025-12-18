import { useMemo } from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getLatestMigrationForEachVM } from '@virtualmachines/utils';

const useVirtualMachineInstanceMigrationMapper = (vmims: V1VirtualMachineInstanceMigration[]) => {
  return useMemo(() => getLatestMigrationForEachVM(vmims), [vmims]);
};

export default useVirtualMachineInstanceMigrationMapper;
