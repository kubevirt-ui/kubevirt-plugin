import {
  DirectVolumeMigration,
  MigMigration,
  MigPlan,
  PersistentVolumesMigPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName } from '@kubevirt-utils/resources/shared';

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
