import { V1beta1Plan } from '@kubev2v/types';

import { buildFilterPath } from '../../shared/urlUtils';

export enum MTVPlanStatus {
  Archived = 'Archived',
  Canceled = 'Canceled',
  CannotStart = 'CannotStart',
  Completed = 'Completed',
  Executing = 'Executing',
  Incomplete = 'Incomplete',
  Paused = 'Paused',
  Ready = 'Ready',
  Unknown = 'Unknown',
}

const CONDITION_TRUE = 'True';

const CONDITION_TYPE = {
  ARCHIVED: 'Archived',
  CANCELED: 'Canceled',
  EXECUTING: 'Executing',
  FAILED: 'Failed',
  PAUSED: 'Paused',
  READY: 'Ready',
  SUCCEEDED: 'Succeeded',
} as const;

const CONDITION_CATEGORY_CRITICAL = 'Critical';

const getTrueConditionTypes = (plan: V1beta1Plan): string[] =>
  (plan?.status?.conditions ?? []).filter((c) => c.status === CONDITION_TRUE).map((c) => c.type);

const hasCriticalCondition = (plan: V1beta1Plan): boolean =>
  (plan?.status?.conditions ?? []).some(
    (c) => c.category === CONDITION_CATEGORY_CRITICAL && c.status === CONDITION_TRUE,
  );

const hasVMErrors = (plan: V1beta1Plan): boolean =>
  (plan?.status?.migration?.vms ?? []).some((vm) => vm?.error);

/**
 * Derives the display status of an MTV Plan from its conditions.
 * Logic matches forklift-console-plugin's getPlanStatus.
 */
export const getMTVPlanStatus = (plan: V1beta1Plan): MTVPlanStatus => {
  if (!plan) return MTVPlanStatus.Unknown;

  const types = getTrueConditionTypes(plan);

  if (types.length === 0) return MTVPlanStatus.Unknown;

  if (plan?.spec?.archived || types.includes(CONDITION_TYPE.ARCHIVED)) {
    return MTVPlanStatus.Archived;
  }

  if (types.includes(CONDITION_TYPE.SUCCEEDED)) return MTVPlanStatus.Completed;
  if (types.includes(CONDITION_TYPE.CANCELED)) return MTVPlanStatus.Canceled;

  if (hasCriticalCondition(plan)) return MTVPlanStatus.CannotStart;

  if (types.includes(CONDITION_TYPE.FAILED) || hasVMErrors(plan)) {
    return MTVPlanStatus.Incomplete;
  }

  if (types.includes(CONDITION_TYPE.EXECUTING)) return MTVPlanStatus.Executing;
  if (types.includes(CONDITION_TYPE.PAUSED)) return MTVPlanStatus.Paused;
  if (types.includes(CONDITION_TYPE.READY)) return MTVPlanStatus.Ready;

  return MTVPlanStatus.Unknown;
};

export type CrossClusterMigrationCounts = {
  failed: number;
  other: number;
  running: number;
};

export const CROSS_CLUSTER_FAILED_STATUSES = [MTVPlanStatus.CannotStart, MTVPlanStatus.Incomplete];
export const CROSS_CLUSTER_RUNNING_STATUSES = [MTVPlanStatus.Executing];
export const CROSS_CLUSTER_OTHER_STATUSES = [
  MTVPlanStatus.Ready,
  MTVPlanStatus.Paused,
  MTVPlanStatus.Completed,
  MTVPlanStatus.Canceled,
  MTVPlanStatus.Archived,
  MTVPlanStatus.Unknown,
];

const CROSS_CLUSTER_FAILED = new Set(CROSS_CLUSTER_FAILED_STATUSES);
const CROSS_CLUSTER_RUNNING = new Set(CROSS_CLUSTER_RUNNING_STATUSES);

export const buildPhaseFilterPath = (basePath: string, statuses: MTVPlanStatus[]): string =>
  buildFilterPath(basePath, 'phase', JSON.stringify(statuses));

export const getCrossClusterMigrationCounts = (
  plans: V1beta1Plan[],
): CrossClusterMigrationCounts => {
  return (plans ?? []).reduce(
    (acc, plan) => {
      const status = getMTVPlanStatus(plan);

      if (CROSS_CLUSTER_FAILED.has(status)) {
        acc.failed++;
      } else if (CROSS_CLUSTER_RUNNING.has(status)) {
        acc.running++;
      } else {
        acc.other++;
      }
      return acc;
    },
    { failed: 0, other: 0, running: 0 },
  );
};
