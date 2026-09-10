import { type ComponentType, type Dispatch, type SetStateAction } from 'react';

import { type BinaryUnit } from '@kubevirt-utils/utils/unitConstants';

import { type MigrationPolicyStateDispatch } from '../../MigrationPolicyEditModal/utils/constants';

export type MigrationPolicyConfigurationComponentProps<
  T extends MigrationPolicyStateDispatch = MigrationPolicyStateDispatch,
> = {
  setState: Dispatch<SetStateAction<T>>;
  state: T;
};

type MigrationPolicyConfigurationEntry<T extends MigrationPolicyStateDispatch> = {
  component: ComponentType<MigrationPolicyConfigurationComponentProps<T>>;
  defaultValue: T;
  description?: string;
  label: string;
};

export type MigrationPolicyConfigurationOption = {
  allowAutoConverge: MigrationPolicyConfigurationEntry<boolean>;
  allowPostCopy: MigrationPolicyConfigurationEntry<boolean>;
  bandwidthPerMigration: MigrationPolicyConfigurationEntry<{
    unit: BinaryUnit;
    value: number;
  }>;
  completionTimeoutPerGiB: MigrationPolicyConfigurationEntry<number>;
};
