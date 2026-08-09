import { type IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import {
  formatGoDuration,
  getOverallProgressFromJob,
  getTestSuitesFromJob,
  TEST_PROGRESS_ANNOTATION_PREFIX,
  type TEST_STATUS,
  TEST_STATUS_COMPLETED,
  TEST_STATUS_FAILED,
  TEST_STATUS_PENDING,
  TEST_STATUS_RUNNING,
  type TestProgressAnnotations,
} from '../../../../utils';
import type {
  JobData,
  JobOverallProgressData,
  JobSuiteProgressData,
  OverallProgress,
  TestSuiteProgress,
} from './types';

export * from './progressHelpers';

const getAllJobData = (job: IoK8sApiBatchV1Job | null | undefined): JobData => {
  if (!job) {
    return {
      overallProgress: {},
      suiteProgress: {},
      testSuites: [],
    };
  }

  try {
    const annotations = (job?.metadata?.annotations ?? {}) as TestProgressAnnotations;

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
      const getAnnotation = (suffix: string): string | undefined =>
        annotations[`${TEST_PROGRESS_ANNOTATION_PREFIX}/${suiteName}-${suffix}`] as
          | string
          | undefined;
      const total = getAnnotation('total');
      const passed = getAnnotation('passed');
      const failed = getAnnotation('failed');
      const percent = getAnnotation('percent');
      const finished = getAnnotation('finished');
      const duration = getAnnotation('duration');

      if (!total) {
        suiteProgress[suiteName] = { started: false };
        continue;
      }

      const totalNum = Number.parseInt(total, 10);
      const passedNum = Number.parseInt(passed ?? '0', 10);
      const failedNum = Number.parseInt(failed ?? '0', 10);
      const percentNum = Number.parseInt(percent ?? '0', 10);

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
  const lastUpdatedString = lastUpdated ?? new Date().toISOString();
  let status: TEST_STATUS;

  if (jobProgress.finished) {
    // Check if there are any failed tests - if so, mark as FAILED, otherwise COMPLETED
    status = (jobProgress?.testsFailed ?? 0) > 0 ? TEST_STATUS_FAILED : TEST_STATUS_COMPLETED;
  } else if ((jobProgress?.duration ?? jobProgress?.progress > 0) && !jobProgress?.finished) {
    status = TEST_STATUS_RUNNING;
  } else {
    status = TEST_STATUS_PENDING;
  }

  return {
    duration: jobProgress?.duration,
    lastUpdated: lastUpdatedString,
    progress: jobProgress?.progress ?? 0,
    status,
    suiteName,
    testsFailed: jobProgress?.testsFailed ?? 0,
    testsPassed: jobProgress?.testsPassed ?? 0,
    testsRun: jobProgress?.testsRun ?? 0,
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
      allJobProgress[suiteName] ?? { started: false },
      overallProgressData.lastUpdated,
    );
    suites.push(progress);
  }

  const completedSuites = suites.filter((suite) => suite.status === TEST_STATUS_COMPLETED).length;
  const currentRunningSuites = suites.filter((suite) => suite.status === TEST_STATUS_RUNNING);
  const failedSuites = suites.filter((suite) => suite.status === TEST_STATUS_FAILED).length;
  const totalSuites = suites.length;
  const passedTests = overallProgressData.passed;

  const jobStartTime = job?.status?.startTime ?? job?.metadata?.creationTimestamp;

  return {
    completedSuites,
    completedTests: overallProgressData.completed,
    currentRunningSuites,
    failedSuites,
    failedTests: overallProgressData.failed,
    lastUpdated: overallProgressData.lastUpdated,
    passedTests,
    progress: overallProgressData.percent ?? 0,
    startTime: jobStartTime,
    suites,
    totalSuites,
    totalTests: overallProgressData.total,
  };
};

export { formatElapsedTime, getElapsedTimeInSeconds } from '@kubevirt-utils/utils/elapsedTime';
