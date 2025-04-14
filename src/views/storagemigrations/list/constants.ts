import {
  DirectVolumeMigration,
  MigMigration,
} from '@kubevirt-utils/resources/migrations/constants';

export type MigPlanMapValue = {
  directVolumeMigration: DirectVolumeMigration;
  migMigration: MigMigration;
};

export type MigPlanMap = Record<string, MigPlanMapValue>;
