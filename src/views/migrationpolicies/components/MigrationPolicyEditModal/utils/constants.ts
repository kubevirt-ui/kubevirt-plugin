import { BinaryUnit } from '@kubevirt-utils/utils/units';

export type EditMigrationPolicyInitialState = {
  migrationPolicyName: string;
  allowAutoConverge?: boolean;
  allowPostCopy?: boolean;
  completionTimeoutPerGiB?: number;
  bandwidthPerMigration?: { value: number; unit: BinaryUnit };
};

export type MigrationPolicyStateDispatch =
  | {
      value: number;
      unit: BinaryUnit;
    }
  | number
  | boolean
  | string;
