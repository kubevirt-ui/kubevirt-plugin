import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getProjectsWithVMs } from '@kubevirt-utils/resources/namespace/helper';

const useProjectsWithVMs = (vms: V1VirtualMachine[]): string[] =>
  useMemo(() => getProjectsWithVMs(vms), [vms]);

export default useProjectsWithVMs;
