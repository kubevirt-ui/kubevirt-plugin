import type { TEST_STATUS } from '../../../../utils';

export type TestSuiteProgress = {
  duration?: string;
  lastUpdated: string;
  progress: number;
  status: TEST_STATUS;
  suiteName: string;
  testsFailed?: number;
  testsPassed?: number;
  testsRun?: number;
  testsSkipped?: number;
};

export type OverallProgress = {
  completedSuites: number;
  completedTests?: number;
  currentRunningSuites?: TestSuiteProgress[];
  estimatedTimeRemaining?: string;
  failedSuites: number;
  failedTests?: number;
  lastUpdated?: string;
  passedTests?: number;
  progress: number;
  startTime?: string;
  suites: TestSuiteProgress[];
  totalSuites: number;
  totalTests?: number;
};

export type JobOverallProgressData = {
  completed?: number;
  failed?: number;
  lastUpdated?: string;
  passed?: number;
  percent?: number;
  total?: number;
};

export type JobSuiteProgressData = {
  duration?: string;
  finished?: boolean;
  progress?: number;
  started: boolean;
  testsFailed?: number;
  testsPassed?: number;
  testsRun?: number;
};

export type JobData = {
  overallProgress: JobOverallProgressData;
  suiteProgress: Record<string, JobSuiteProgressData>;
  testSuites: string[];
};
