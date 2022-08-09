import { BinaryUnit } from '@kubevirt-utils/utils/units';

export type EditMigrationPolicyInitialState = {
  migrationPolicyName: string;
  autoConverge: boolean;
  postCopy: boolean;
  completionTimeout: { enabled: boolean; value: number };
  bandwidthPerMigration: { value: number; unit: BinaryUnit };
};

export type MigrationPolicyStateDispatch =
  | {
      enabled: boolean;
      value: number;
    }
  | {
      value: number;
      unit: BinaryUnit;
    }
  | boolean
  | string;
