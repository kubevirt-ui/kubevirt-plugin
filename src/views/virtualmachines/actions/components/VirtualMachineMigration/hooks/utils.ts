import { LiveMigrationProgress } from '../../../../../../utils/resources/migrations/constants';

export const sortMigrationsProgresses = (
  a: LiveMigrationProgress,
  b: LiveMigrationProgress,
): number => {
  if (a.vmName === b.vmName) return a.pvcRef.name.localeCompare(b.pvcRef.name);

  return a.vmName.localeCompare(b.vmName);
};
