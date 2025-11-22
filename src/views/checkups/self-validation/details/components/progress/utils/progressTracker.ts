import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import {
  formatGoDuration,
  getOverallProgressFromJob,
  getTestSuitesFromJob,
  TEST_PROGRESS_ANNOTATION_PREFIX,
  TEST_STATUS,
  TEST_STATUS_COMPLETED,
  TEST_STATUS_FAILED,
  TEST_STATUS_PENDING,
  TEST_STATUS_RUNNING,
  TEST_SUITE_OPTIONS,
  TestProgressAnnotations,
} from '../../../../utils';

import type {
  JobData,
  JobOverallProgressData,
  JobSuiteProgressData,
  OverallProgress,
  TestSuiteProgress,
} from './types';

const getAllJobData = (job: IoK8sApiBatchV1Job | null | undefined): JobData => {
  if (!job) {
    return {
      overallProgress: {},
      suiteProgress: {},
      testSuites: [],
    };
  }

  try {
    const annotations = (job?.metadata?.annotations || {}) as TestProgressAnnotations;

    const testSuites = getTestSuitesFromJob(job);

    const suiteProgress: Record<string, JobSuiteProgressData> = {};

    // Get overall progress including lastUpdated from job annotations
    const overallProgress = {
      ...getOverallProgressFromJob(job),
      percent: annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/percent`]
        ? Number.parseInt(annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/percent`], 10)
        : undefined,
    };

    for (const suiteName of testSuites) {
      const total = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/${suiteName}-total`];
      const passed = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/${suiteName}-passed`];
      const failed = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/${suiteName}-failed`];
      const percent = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/${suiteName}-percent`];
      const finished = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/${suiteName}-finished`];
      const duration = annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/${suiteName}-duration`];

      if (!total) {
        suiteProgress[suiteName] = { started: false };
        continue;
      }

      const totalNum = Number.parseInt(total, 10);
      const passedNum = Number.parseInt(passed || '0', 10);
      const failedNum = Number.parseInt(failed || '0', 10);
      const percentNum = Number.parseInt(percent || '0', 10);

      suiteProgress[suiteName] = {
        duration: duration ? formatGoDuration(duration) : undefined,
        finished: finished === 'true',
        progress: percentNum,
        started: percentNum > 0,
        testsFailed: failedNum,
        testsPassed: passedNum,
        testsRun: totalNum,
      };
    }

    return { overallProgress, suiteProgress, testSuites };
  } catch (error) {
    kubevirtConsole.warn('Could not read job data:', error);
    // Return empty data - we can't get test suites from job, so return empty
    return {
      overallProgress: {},
      suiteProgress: {},
      testSuites: [],
    };
  }
};

/**
 * Helper function to parse progress data for a specific suite from job data
 */
const parseSuiteProgressFromJobData = (
  suiteName: string,
  jobProgress: JobSuiteProgressData,
  lastUpdated?: string,
): TestSuiteProgress => {
  // Use provided lastUpdated or current timestamp as ISO string
  const lastUpdatedString = lastUpdated || new Date().toISOString();
  let status: TEST_STATUS;

  if (jobProgress.finished) {
    status = TEST_STATUS_COMPLETED;
  } else if ((jobProgress?.duration || jobProgress?.progress > 0) && !jobProgress?.finished) {
    status = TEST_STATUS_RUNNING;
  } else {
    status = TEST_STATUS_PENDING;
  }

  return {
    duration: jobProgress?.duration,
    lastUpdated: lastUpdatedString,
    progress: jobProgress?.progress || 0,
    status,
    suiteName,
    testsFailed: jobProgress?.testsFailed || 0,
    testsPassed: jobProgress?.testsPassed || 0,
    testsRun: jobProgress?.testsRun || 0,
  };
};

/**
 * Gets overall progress for all test suites
 */
export const getOverallProgress = (job: IoK8sApiBatchV1Job | null | undefined): OverallProgress => {
  const suites: TestSuiteProgress[] = [];

  let allJobProgress: Record<string, JobSuiteProgressData> = {};
  let overallProgressData: JobOverallProgressData = {};
  let testSuites: string[] = [];

  if (job) {
    const jobData = getAllJobData(job);
    testSuites = jobData.testSuites;
    allJobProgress = jobData.suiteProgress;
    overallProgressData = jobData.overallProgress;
  }

  if (testSuites.length === 0) {
    kubevirtConsole.warn('No test suites found in job environment variables, using empty array');
  }

  for (const suiteName of testSuites) {
    const progress = parseSuiteProgressFromJobData(
      suiteName,
      allJobProgress[suiteName] || { started: false },
      overallProgressData.lastUpdated,
    );
    suites.push(progress);
  }

  const completedSuites = suites.filter((s) => s.status === TEST_STATUS_COMPLETED).length;
  const currentRunningSuites = suites.filter((s) => s.status === TEST_STATUS_RUNNING);
  const failedSuites = suites.filter((s) => s.status === TEST_STATUS_FAILED).length;
  const totalSuites = suites.length;
  const passedTests = overallProgressData.passed;

  const jobStartTime = job?.status?.startTime || job?.metadata?.creationTimestamp;

  return {
    completedSuites,
    completedTests: overallProgressData.completed,
    currentRunningSuites,
    failedSuites,
    failedTests: overallProgressData.failed,
    lastUpdated: overallProgressData.lastUpdated,
    passedTests,
    progress: overallProgressData.percent,
    startTime: jobStartTime,
    suites,
    totalSuites,
    totalTests: overallProgressData.total,
  };
};

export const getElapsedTimeInSeconds = (startTime: string): number => {
  if (!startTime) return 0;
  try {
    const dateStartTime = new Date(startTime);
    const now = new Date();
    return Math.floor((now.getTime() - dateStartTime.getTime()) / 1000);
  } catch {
    return 0;
  }
};

export const getTotalSkippedTests = (suites: TestSuiteProgress[]): number => {
  if (!suites) {
    return 0;
  }

  let totalSkipped = 0;
  for (const suite of suites) {
    if (suite.status === TEST_STATUS_COMPLETED || suite.status === TEST_STATUS_FAILED) {
      if (
        suite.testsRun !== undefined &&
        suite.testsPassed !== undefined &&
        suite.testsFailed !== undefined
      ) {
        const skipped = suite.testsRun - (suite.testsPassed + suite.testsFailed);
        totalSkipped += Math.max(0, skipped);
      }
    }
  }

  return totalSkipped;
};

export const formatElapsedTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const getTestSuiteLabel = (suiteName: string): string => {
  return TEST_SUITE_OPTIONS.find((option) => option.value === suiteName)?.label || suiteName;
};
