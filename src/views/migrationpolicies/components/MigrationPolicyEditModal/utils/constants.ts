import { type BinaryUnit, type QuantityUnit } from '@kubevirt-utils/utils/unitConstants';

import { type MigrationPolicyBooleanSpecKey } from '../../../utils/constants';

export type EditMigrationPolicyInitialState = Partial<
  Record<MigrationPolicyBooleanSpecKey, boolean>
> & {
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
