import {
  DirectVolumeMigration,
  MigMigration,
  MigPlan,
  PersistentVolumesMigPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { getMigMigrationStartTimestamp } from '@kubevirt-utils/resources/migrations/utils';
import { getName } from '@kubevirt-utils/resources/shared';

import { getMigrationPercentage } from './components/utils';
import { MigPlanMap } from './constants';

export const getSelectedPVFromMigPlan = (migPlan: MigPlan): PersistentVolumesMigPlan[] =>
  migPlan?.spec?.persistentVolumes?.filter((pv) => pv?.selection?.action === 'copy');

export const getStorageClassesFromMigPlan = (migPlan: MigPlan): string[] =>
  Array.from(new Set(getSelectedPVFromMigPlan(migPlan)?.map((pv) => pv?.selection?.storageClass)));

export const createMigPlanMap = (
  migPlans: MigPlan[],
  migMigrations: MigMigration[],
  directVolumeMigrations: DirectVolumeMigration[],
): MigPlanMap =>
  migPlans.reduce((acc, migPlan) => {
    const migPlanName = getName(migPlan);
    const migMigration = migMigrations.find(
      (migration) => migration.spec?.migPlanRef?.name === migPlanName,
    );

    const directVolumeMigration = directVolumeMigrations.find(
      (migration) => migration.metadata?.ownerReferences?.[0]?.name === getName(migMigration),
    );

    acc[migPlanName] = { directVolumeMigration, migMigration };

    return acc;
  }, {} as MigPlanMap);

export const compareMigrationVolumes = (a: MigPlan, b: MigPlan) => {
  const aVolumes = getSelectedPVFromMigPlan(a)?.length || 0;
  const bVolumes = getSelectedPVFromMigPlan(b)?.length || 0;

  return aVolumes - bVolumes;
};

export const compareMigrationStorageClasses = (a: MigPlan, b: MigPlan) => {
  const aStorageClasses = getStorageClassesFromMigPlan(a)?.[0];
  const bStorageClasses = getStorageClassesFromMigPlan(b)?.[0];

  return aStorageClasses?.localeCompare(bStorageClasses);
};

export const compareMigrationStarted = (migPlanMap: MigPlanMap) => (a: MigPlan, b: MigPlan) => {
  const aMigration = migPlanMap[getName(a)]?.migMigration;
  const bMigration = migPlanMap[getName(b)]?.migMigration;

  const aStarted = getMigMigrationStartTimestamp(aMigration);
  const bStarted = getMigMigrationStartTimestamp(bMigration);
  return aStarted?.localeCompare(bStarted);
};

export const compareMigrationStatus = (migPlanMap: MigPlanMap) => (a: MigPlan, b: MigPlan) => {
  const aMigration = migPlanMap[getName(a)]?.migMigration;
  const aDirectVolumeMigration = migPlanMap[getName(a)]?.directVolumeMigration;
  const bMigration = migPlanMap[getName(b)]?.migMigration;
  const bDirectVolumeMigration = migPlanMap[getName(b)]?.directVolumeMigration;

  const aStarted = getMigrationPercentage(aMigration, aDirectVolumeMigration);
  const bStarted = getMigrationPercentage(bMigration, bDirectVolumeMigration);
  return aStarted - bStarted;
};
