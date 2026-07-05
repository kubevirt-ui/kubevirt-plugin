import { type StorageMigrationProbeCsv } from './useClusterStorageMigrationApiProbe';

export const csvBelow21 = {
  installedCSV: { spec: { version: '4.20.5' } },
  loaded: true,
} as StorageMigrationProbeCsv;
