import { MigMigration } from './constants';

export const getMigMigrationStartTimestamp = (migMigration: MigMigration) =>
  migMigration?.status?.startTimestamp;
