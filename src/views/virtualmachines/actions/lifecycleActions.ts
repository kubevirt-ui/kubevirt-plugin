// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import { type TFunction } from 'i18next';

import { type LifecycleActions } from './lifecycleActionTypes';
import { createLifecyclePauseResetActions } from './lifecyclePauseResetActions';
import { createLifecyclePowerActions } from './lifecyclePowerActions';

export type { LifecycleActions } from './lifecycleActionTypes';

export const createLifecycleActions = (t: TFunction): LifecycleActions => ({
  ...createLifecyclePauseResetActions(t),
  ...createLifecyclePowerActions(t),
});
