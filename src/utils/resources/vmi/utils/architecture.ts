import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';

import { getVMIArchitecture } from './selectors';

export const hasS390xArchitecture = (vmi: V1VirtualMachineInstance) =>
  getVMIArchitecture(vmi) === ARCHITECTURES.S390X;
