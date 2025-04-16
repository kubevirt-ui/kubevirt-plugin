import { MigPlan } from '@kubevirt-utils/resources/migrations/constants';

export const sortMigPlansByCreationTimestamp = (a: MigPlan, b: MigPlan): number =>
  a?.metadata?.creationTimestamp?.localeCompare(b?.metadata?.creationTimestamp);
