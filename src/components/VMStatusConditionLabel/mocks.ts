import { VMStatusCondition } from '@kubevirt-types/vm';

export const conditionsMock: VMStatusCondition[] = [
  {
    lastTransitionTime: new Date().toString(),
    message: 'failure',
    reason: 'no_vmi',
    status: 'true',
    type: 'Failure',
  },
  {
    lastTransitionTime: new Date().toString(),
    message: 'success',
    reason: 'ready',
    status: 'true',
    type: 'Ready',
  },
];
