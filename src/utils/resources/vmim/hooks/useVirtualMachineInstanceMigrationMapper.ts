import { useMemo } from 'react';

import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getLatestMigrationForEachVM } from '@virtualmachines/utils';
import { type VMIMMapper } from '@virtualmachines/utils/mappers';

const useVirtualMachineInstanceMigrationMapper = (
  vmims: V1VirtualMachineInstanceMigration[],
): VMIMMapper => {
  return useMemo(() => getLatestMigrationForEachVM(vmims), [vmims]);
};

export default useVirtualMachineInstanceMigrationMapper;
