import { type TFunction } from 'i18next';

import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export enum CheckupsStatus {
  'Deleting' = 'deleting',
  'Done' = 'done',
  'Failed' = 'failed',
  'Pending' = 'pending',
  'Running' = 'running',
}

const FAILED_JOB_CONDITION_TYPES = new Set(['Failed', 'FailureTarget']);

export const isJobFailedCondition = (job?: IoK8sApiBatchV1Job): boolean => {
  const status = job?.status;
  if (!status) {
    return false;
  }

  const hasFailedCondition = status.conditions?.some(
    (condition) => FAILED_JOB_CONDITION_TYPES.has(condition.type) && condition.status === 'True',
  );
  if (hasFailedCondition) {
    return true;
  }

  const hasUncountedFailedPods = (status.uncountedTerminatedPods?.failed?.length ?? 0) > 0;
  const isStillActive = Boolean(status.active && status.active > 0);
  return hasUncountedFailedPods && !isStillActive;
};

export const getJobStatus = (job?: IoK8sApiBatchV1Job): CheckupsStatus => {
  if (!job) {
    return CheckupsStatus.Pending;
  }

  const { status } = job;
  if (!status) {
    return CheckupsStatus.Pending;
  }

  if (status.succeeded && status.succeeded > 0) {
    return CheckupsStatus.Done;
  }
  if (status.failed && status.failed > 0) {
    return CheckupsStatus.Failed;
  }
  if (isJobFailedCondition(job)) {
    return CheckupsStatus.Failed;
  }
  if (status.active && status.active > 0) {
    return CheckupsStatus.Running;
  }
  if (status.terminating && status.terminating > 0) {
    return CheckupsStatus.Deleting;
  }

  return CheckupsStatus.Pending;
};

export const isJobRunning = (job?: IoK8sApiBatchV1Job): boolean =>
  getJobStatus(job) === CheckupsStatus.Running;

export const getIsJobCompleted = (job?: IoK8sApiBatchV1Job): boolean => {
  const status = getJobStatus(job);
  return status === CheckupsStatus.Done || status === CheckupsStatus.Failed;
};

const STATUS_RANK: Record<CheckupsStatus, number> = {
  [CheckupsStatus.Deleting]: 3,
  [CheckupsStatus.Done]: 5,
  [CheckupsStatus.Failed]: 4,
  [CheckupsStatus.Pending]: 2,
  [CheckupsStatus.Running]: 1,
};

export const getJobStatusRank = (job?: IoK8sApiBatchV1Job): number => {
  const status = getJobStatus(job);
  return STATUS_RANK[status];
};

export const getCSVExportStatusLabel = (status: CheckupsStatus, t: TFunction): string => {
  const labels: Record<CheckupsStatus, string> = {
    [CheckupsStatus.Deleting]: t('Deleting'),
    [CheckupsStatus.Done]: t('Succeeded'),
    [CheckupsStatus.Failed]: t('Failed'),
    [CheckupsStatus.Pending]: t('Pending'),
    [CheckupsStatus.Running]: t('Running'),
  };
  return labels[status] ?? t('Unknown');
};

export const getConfigMapStatus = (
  configMap: { data?: Record<string, string> } | undefined,
  jobStatus: CheckupsStatus,
): CheckupsStatus => {
  const succeeded = configMap?.data?.['status.succeeded'];

  if (succeeded === 'true') {
    return CheckupsStatus.Done;
  }
  if (succeeded === 'false' || jobStatus === CheckupsStatus.Failed) {
    return CheckupsStatus.Failed;
  }
  if (succeeded === undefined && jobStatus === CheckupsStatus.Done) {
    return CheckupsStatus.Failed;
  }
  if (succeeded === undefined && jobStatus === CheckupsStatus.Running) {
    return CheckupsStatus.Running;
  }

  return CheckupsStatus.Running;
};
