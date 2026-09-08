import { type MigPlan, type MigPlanPV } from '../constants';

export const getMigPlanSpecNamespaces = (migPlan: MigPlan): string[] =>
  migPlan.spec?.namespaces ?? [];

export const getMigPlanSpecPersistentVolumes = (migPlan: MigPlan): MigPlanPV[] =>
  migPlan.spec?.persistentVolumes ?? [];

export const getMigPlanPVCNamespace = (volume: MigPlanPV): string | undefined =>
  volume.pvc?.namespace;

export const getMigPlanPVCName = (volume: MigPlanPV): string | undefined => volume.pvc?.name;

export const isMigPlanSpecClosed = (migPlan: MigPlan): boolean => migPlan.spec?.closed === true;
