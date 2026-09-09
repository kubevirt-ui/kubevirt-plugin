import { type TFunction } from 'i18next';

import { createLifecycleActions, type LifecycleActions } from './lifecycleActions';
import { createMigrationActions, type MigrationActions } from './migrationActions';
import { createResourceActions, type ResourceActions } from './resourceActions';

export const createVirtualMachineActionFactory = (
  t: TFunction,
): LifecycleActions & MigrationActions & ResourceActions => ({
  ...createLifecycleActions(t),
  ...createMigrationActions(t),
  ...createResourceActions(t),
});
