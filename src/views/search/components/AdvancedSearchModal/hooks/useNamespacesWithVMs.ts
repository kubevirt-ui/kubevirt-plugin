import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/utils';

const useNamespacesWithVMs = (vms: V1VirtualMachine[]): string[] =>
  useMemo(
    () => [...new Set(vms?.map(getNamespace))].sort((a, b) => universalComparator(a, b)),
    [vms],
  );

export default useNamespacesWithVMs;
