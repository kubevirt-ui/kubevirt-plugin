import { type TFunction } from 'i18next';

import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  CheckupsStatus,
  getCSVExportStatusLabel,
  getJobStatus,
  isJobFailedCondition,
  isJobRunning,
} from './utils';

const buildJob = (status: IoK8sApiBatchV1Job['status']): IoK8sApiBatchV1Job => ({
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: { name: 'test-job', namespace: 'test' },
  status,
});

describe('getJobStatus', () => {
  it('should return Pending when the job is undefined', () => {
    expect(getJobStatus(undefined)).toBe(CheckupsStatus.Pending);
  });

  it('should return Pending when the job has no status', () => {
    expect(getJobStatus(buildJob(undefined))).toBe(CheckupsStatus.Pending);
  });

  it('should return Done when succeeded is greater than 0', () => {
    expect(getJobStatus(buildJob({ succeeded: 1 }))).toBe(CheckupsStatus.Done);
  });

  it('should return Failed when failed count is greater than 0', () => {
    expect(getJobStatus(buildJob({ failed: 1 }))).toBe(CheckupsStatus.Failed);
  });

  it('should return Running when active is greater than 0', () => {
    expect(getJobStatus(buildJob({ active: 1 }))).toBe(CheckupsStatus.Running);
  });

  it('should return Deleting when terminating is greater than 0', () => {
    expect(getJobStatus(buildJob({ terminating: 1 }))).toBe(CheckupsStatus.Deleting);
  });

  it('should return Pending for an empty status object', () => {
    expect(getJobStatus(buildJob({}))).toBe(CheckupsStatus.Pending);
  });

  it('should return Failed when a FailureTarget condition is True but failed count is unset', () => {
    const job = buildJob({
      conditions: [
        {
          message: 'Job has reached the specified backoff limit',
          reason: 'BackoffLimitExceeded',
          status: 'True',
          type: 'FailureTarget',
        },
      ],
      ready: 0,
      uncountedTerminatedPods: { failed: ['pod-uid-1'] },
    });

    expect(getJobStatus(job)).toBe(CheckupsStatus.Failed);
    expect(isJobRunning(job)).toBe(false);
  });

  it('should return Failed when a Failed condition is True', () => {
    const job = buildJob({
      conditions: [{ status: 'True', type: 'Failed' }],
    });

    expect(getJobStatus(job)).toBe(CheckupsStatus.Failed);
  });

  it('should not treat a False condition as failed', () => {
    const job = buildJob({
      active: 1,
      conditions: [{ status: 'False', type: 'FailureTarget' }],
    });

    expect(getJobStatus(job)).toBe(CheckupsStatus.Running);
  });

  it('should return Failed when uncounted failed pods exist and nothing is active, even without a condition yet', () => {
    const job = buildJob({ uncountedTerminatedPods: { failed: ['pod-uid-1'] } });

    expect(getJobStatus(job)).toBe(CheckupsStatus.Failed);
  });

  it('should not treat uncounted failed pods as Failed while the job is still active', () => {
    const job = buildJob({ active: 1, uncountedTerminatedPods: { failed: ['pod-uid-1'] } });

    expect(getJobStatus(job)).toBe(CheckupsStatus.Running);
  });
});

describe('getCSVExportStatusLabel', () => {
  const t = ((key: string) => key) as TFunction;

  it('should return Succeeded for Done', () => {
    expect(getCSVExportStatusLabel(CheckupsStatus.Done, t)).toBe('Succeeded');
  });
});

describe('isJobFailedCondition', () => {
  it('should return false when the job is undefined', () => {
    expect(isJobFailedCondition(undefined)).toBe(false);
  });

  it('should return false when there is no status', () => {
    expect(isJobFailedCondition(buildJob(undefined))).toBe(false);
  });

  it('should return false when there are no failure signals', () => {
    expect(isJobFailedCondition(buildJob({ active: 1 }))).toBe(false);
  });
});
