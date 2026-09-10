import type { QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import type { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';

export type EditMigrationPolicyInitialState = {
  allowAutoConverge?: boolean;
  allowPostCopy?: boolean;
  bandwidthPerMigration?: { unit: QuantityUnit; value: number };
  completionTimeoutPerGiB?: number;
  migrationPolicyName: string;
};

export type MigrationPolicyStateDispatch =
  | {
      unit: BinaryUnit;
      value: number;
    }
  | boolean
  | number
  | string;
