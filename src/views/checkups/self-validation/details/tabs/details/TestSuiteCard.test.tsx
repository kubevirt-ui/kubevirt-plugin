import { render, screen } from '@testing-library/react';

import TestSuiteCard, { type TestSuiteData } from './TestSuiteCard';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : key.replace('{{count}}', String(options.count)),
  }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  GreenCheckCircleIcon: () => null,
  RedExclamationCircleIcon: () => null,
}));

// The utils barrel pulls in modules using non-aliased `src/...` imports that Jest cannot resolve
jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils/selfValidationResults'),
  ...jest.requireActual('../../../utils/parseFailedTestGroups'),
}));

jest.mock('../../components/progress/utils/progressTracker', () => ({
  getTestSuiteLabel: (name: string) => name,
}));

const renderCard = (suiteData: TestSuiteData) =>
  render(<TestSuiteCard isExpanded onToggle={jest.fn()} suiteData={suiteData} suiteName="tier2" />);

describe('TestSuiteCard failed tests rendering', () => {
  it('renders categorized failed tests with category headings', () => {
    renderCard({
      failed_tests: {
        '': ['virt_special_infra_cluster_verification_failed'],
        storage: ['test_clone_a', 'test_clone_b'],
      },
      tests_failures: 3,
      tests_run: 10,
    });

    expect(screen.getByText('Failed tests (3)')).toBeInTheDocument();
    expect(screen.getByText('Uncategorized (1)')).toBeInTheDocument();
    expect(screen.getByText('storage (2)')).toBeInTheDocument();
    expect(screen.getByText('test_clone_b')).toBeInTheDocument();
  });

  it.each([undefined, {}])('renders no failed tests section for %p', (failedTests) => {
    renderCard({ failed_tests: failedTests, tests_passed: 5, tests_run: 5 });

    expect(screen.queryByText(/Failed tests/)).not.toBeInTheDocument();
  });

  it('renders without throwing for unexpected failed_tests data', () => {
    expect(() =>
      renderCard({ failed_tests: ['test_a', null] as never, tests_failures: 1, tests_run: 5 }),
    ).not.toThrow();

    expect(screen.queryByText(/Failed tests/)).not.toBeInTheDocument();
  });
});
