import type { RequestContextTemplateConfig } from '@/data-factories';

/**
 * Base type for RequestContext Template API test case parameters
 */
export type RequestContextTemplateTestCaseParams = {
  expectedBehavior?: {
    shouldCreate: boolean;
    timeout?: number;
  };
  templateConfig: Partial<RequestContextTemplateConfig>;
  testCaseName: string;
};

/**
 * RequestContext Template API creation test fixtures
 */
export const REQUEST_CONTEXT_TEMPLATE_FIXTURES: RequestContextTemplateTestCaseParams[] = [
  {
    expectedBehavior: {
      shouldCreate: true,
      timeout: 30000,
    },
    templateConfig: {
      cpuCores: 1,
      memory: '2Gi',
      osLabel: 'fedora',
      osName: 'Fedora',
      workload: 'server',
      workloadLabel: 'server',
    },
    testCaseName: 'basic Fedora server template via API',
  },
];

/**
 * Combined test suite fixture - for smoke testing
 */
export const REQUEST_CONTEXT_TEMPLATE_SMOKE_TEST_FIXTURE: RequestContextTemplateTestCaseParams = {
  expectedBehavior: {
    shouldCreate: true,
    timeout: 30000,
  },
  templateConfig: {
    cpuCores: 2,
    memory: '4Gi',
    runStrategy: 'Halted',
    workload: 'server',
    workloadLabel: 'server',
  },
  testCaseName: 'standard template for smoke testing via API',
};
