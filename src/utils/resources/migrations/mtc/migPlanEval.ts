import {
  CONDITION_TYPE_FAILED,
  CONDITION_TYPE_SUCCEEDED,
  K8S_CONDITION_STATUS_TRUE,
  type MigPlan,
  STATUS_COMPLETED,
  STATUS_READY,
} from '../constants';

import { isMigPlanSpecClosed } from './selectors';

export const migPlanHasFailedCondition = (migPlan: MigPlan): boolean =>
  migPlan.status?.conditions?.some(
    (condition) =>
      condition.type === CONDITION_TYPE_FAILED && condition.status === K8S_CONDITION_STATUS_TRUE,
  ) ?? false;

const migPlanIsReady = (migPlan: MigPlan): boolean =>
  migPlan.status?.conditions?.some(
    (condition) =>
      condition.type === STATUS_READY && condition.status === K8S_CONDITION_STATUS_TRUE,
  ) ?? false;

const migPlanIsClosed = (migPlan: MigPlan): boolean => isMigPlanSpecClosed(migPlan);

export const migPlanShowsCompletedInOverview = (migPlan: MigPlan): boolean =>
  migPlanIsClosed(migPlan) || migPlanIsReady(migPlan);

export const migPlanCompletedConditionTime = (migPlan: MigPlan): string | undefined =>
  migPlan.status?.conditions?.find(
    (condition) =>
      condition.type === STATUS_READY && condition.status === K8S_CONDITION_STATUS_TRUE,
  )?.lastTransitionTime ??
  migPlan.status?.conditions?.find(
    (condition) =>
      (condition.type === CONDITION_TYPE_SUCCEEDED || condition.type === STATUS_COMPLETED) &&
      condition.status === K8S_CONDITION_STATUS_TRUE,
  )?.lastTransitionTime ??
  migPlan.metadata?.creationTimestamp;
