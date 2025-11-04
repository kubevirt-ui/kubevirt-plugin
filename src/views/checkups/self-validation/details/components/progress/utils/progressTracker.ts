import { JobModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import {
  formatGoDuration,
  getOverallProgressFromJob,
  getTestSuitesFromJob,
  TEST_STATUS,
  TEST_STATUS_COMPLETED,
  TEST_STATUS_FAILED,
  TEST_STATUS_PENDING,
  TEST_STATUS_RUNNING,
  TEST_SUITE_OPTIONS,
} from '../../../../utils';

export interface TestSuiteProgress {
  duration?: string;
  lastUpdated: Date;
  progress: number;
  status: TEST_STATUS;
  suiteName: string;
  testsFailed?: number;
  testsPassed?: number;
  testsRun?: number;
  testsSkipped?: number;
}

export interface OverallProgress {
  completedSuites: number;
  completedTests?: number;
  currentRunningSuites?: TestSuiteProgress[];
  estimatedTimeRemaining?: string;
  failedSuites: number;
  failedTests?: number;
  lastUpdated?: string;
  overallProgress: number;
  passedTests?: number;
  startTime?: string;
  suites: TestSuiteProgress[];
  totalSuites: number;
  totalTests?: number;
}

const getAllJobData = async (
  jobName: string,
  namespace: string,
): Promise<{
  overallProgress: {
    completed?: number;
    failed?: number;
    lastUpdated?: string;
    passed?: number;
    percent?: number;
    total?: number;
  };
  suiteProgress: {
    [suiteName: string]: {
      duration?: string;
      finished?: boolean;
      progress?: number;
      started: boolean;
      testsFailed?: number;
      testsPassed?: number;
      testsRun?: number;
    };
  };
  testSuites: string[];
}> => {
  try {
    const job = await k8sGet({
      model: JobModel,
      name: jobName,
      ns: namespace,
    });

    const annotations = job?.metadata?.annotations || {};

    const testSuites = getTestSuitesFromJob(job);

    const suiteProgress: {
      [suiteName: string]: {
        duration?: string;
        finished?: boolean;
        progress?: number;
        started: boolean;
        testsFailed?: number;
        testsPassed?: number;
        testsRun?: number;
      };
    } = {};

    // Get overall progress including lastUpdated from job annotations
    const overallProgress = {
      ...getOverallProgressFromJob(job),
      percent: annotations['test-progress/percent']
        ? Number.parseInt(annotations['test-progress/percent'], 10)
        : undefined,
    };

    for (const suiteName of testSuites) {
      const total = annotations[`test-progress/${suiteName}-total`];
      const passed = annotations[`test-progress/${suiteName}-passed`];
      const failed = annotations[`test-progress/${suiteName}-failed`];
      const percent = annotations[`test-progress/${suiteName}-percent`];
      const finished = annotations[`test-progress/${suiteName}-finished`];
      const duration = annotations[`test-progress/${suiteName}-duration`];

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
  jobProgress: {
    duration?: string;
    finished?: boolean;
    progress?: number;
    started: boolean;
    testsFailed?: number;
    testsPassed?: number;
    testsRun?: number;
  },
  lastUpdated?: string,
): TestSuiteProgress => {
  const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : new Date();
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
    lastUpdated: lastUpdatedDate,
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
export const getOverallProgress = async (
  pod: IoK8sApiCoreV1Pod,
  namespace: string,
  jobName?: string,
): Promise<OverallProgress> => {
  const suites: TestSuiteProgress[] = [];

  let allJobProgress: { [suiteName: string]: any } = {};
  let overallProgressData: {
    completed?: number;
    failed?: number;
    lastUpdated?: string;
    passed?: number;
    percent?: number;
    total?: number;
  } = {};
  let testSuites: string[] = [];

  if (jobName) {
    const jobData = await getAllJobData(jobName, namespace);
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

  // Use annotation data for overall progress if available, otherwise calculate from suites
  const overallProgress =
    overallProgressData.percent ??
    Math.round(suites.reduce((sum, suite) => sum + suite.progress, 0) / totalSuites);

  // Use passed value from annotations if available, otherwise calculate from completed - failed
  const passedTests =
    overallProgressData.passed ??
    (overallProgressData.completed && overallProgressData.failed
      ? overallProgressData.completed - overallProgressData.failed
      : undefined);

  const podStartTime = pod.status?.startTime || pod.metadata?.creationTimestamp;

  return {
    completedSuites,
    completedTests: overallProgressData.completed,
    currentRunningSuites,
    failedSuites,
    failedTests: overallProgressData.failed,
    lastUpdated: overallProgressData.lastUpdated,
    overallProgress,
    passedTests,
    startTime: podStartTime,
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
