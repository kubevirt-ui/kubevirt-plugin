import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

const useGroupsWithVMs = (vms: V1VirtualMachine[]): string[] =>
  useMemo(
    () =>
      [...new Set(vms?.map((vm) => getLabel(vm, VM_FOLDER_LABEL)).filter(Boolean))].sort((a, b) =>
        universalComparator(a, b),
      ),
    [vms],
  );

export default useGroupsWithVMs;
