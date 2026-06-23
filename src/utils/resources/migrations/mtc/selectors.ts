import { MigPlan, MigPlanPV } from '../constants';

export const getMigPlanSpecNamespaces = (migPlan: MigPlan): string[] =>
  migPlan.spec?.namespaces ?? [];

export const getMigPlanSpecPersistentVolumes = (migPlan: MigPlan): MigPlanPV[] =>
  migPlan.spec?.persistentVolumes ?? [];

export const getMigPlanPVCNamespace = (pv: MigPlanPV): string | undefined => pv.pvc?.namespace;

export const getMigPlanPVCName = (pv: MigPlanPV): string | undefined => pv.pvc?.name;

export const isMigPlanSpecClosed = (migPlan: MigPlan): boolean => migPlan.spec?.closed === true;
