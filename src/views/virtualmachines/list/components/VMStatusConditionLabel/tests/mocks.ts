import { V1VirtualMachineCondition } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const conditionsMock: V1VirtualMachineCondition[] = [
  {
    message: 'no vmi found',
    reason: 'no_vmi',
    status: 'true',
    type: 'Failure',
  },
  {
    message: 'success',
    reason: 'ready',
    status: 'true',
    type: 'Ready',
  },
];
