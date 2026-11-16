import { fireEvent, render, screen } from '@testing-library/react';

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
  ...jest.requireActual('../../../utils/normalizeFailedTests'),
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
        infrastructure: ['test_start_vm'],
        storage: ['test_clone_a', 'test_clone_b'],
      },
      tests_failures: 4,
      tests_run: 10,
    });

    expect(screen.getByText('Failed tests (4)')).toBeInTheDocument();
    expect(screen.getByText('Uncategorized (1)')).toBeInTheDocument();
    expect(screen.getByText('infrastructure (1)')).toBeInTheDocument();
    expect(screen.getByText('storage (2)')).toBeInTheDocument();
    expect(screen.getByText('test_clone_b')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([undefined, {}, { storage: [] }])(
    'renders no failed tests section for %p',
    (failedTests) => {
      renderCard({ failed_tests: failedTests, tests_passed: 5, tests_run: 5 });

      expect(screen.queryByText(/Failed tests/)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it.each([
    ['null', null],
    ['a string', 'boom'],
    ['a number', 7],
    ['an object with non-array values', { storage: 'test_a' }],
    ['a top-level array', ['test_a', 'test_b']],
    ['an empty top-level array', []],
    ['a category with non-string items', { storage: ['test_a', 1] }],
    ['a Date', new Date()],
    ['a Map', new Map()],
    ['a null-prototype object', Object.create(null)],
  ])('renders without throwing or showing an alert for malformed failed_tests: %s', (_l, value) => {
    expect(() =>
      renderCard({ failed_tests: value as never, tests_failures: 1, tests_run: 5 }),
    ).not.toThrow();

    expect(screen.queryByText(/Failed tests/)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/unexpected format/)).not.toBeInTheDocument();
  });

  it('renders only the valid categories when some entries are malformed', () => {
    renderCard({
      failed_tests: { network: 'test_a', storage: ['test_b'] } as never,
      tests_failures: 2,
      tests_run: 5,
    });

    expect(screen.getByText('Failed tests (1)')).toBeInTheDocument();
    expect(screen.getByText('test_b')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    ['non-numeric counts', { tests_failures: 'x', tests_passed: null, tests_run: 'many' }],
    ['a non-string duration', { tests_duration: 42, tests_failures: 1, tests_run: 2 }],
    ['an empty suite', {}],
  ])('renders without throwing for a malformed suite payload with %s', (_label, suiteData) => {
    expect(() => renderCard(suiteData as never)).not.toThrow();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not render category headings when the only category is the empty string', () => {
    renderCard({ failed_tests: { '': ['test_a'] }, tests_failures: 1, tests_run: 2 });

    expect(screen.getByText('Failed tests (1)')).toBeInTheDocument();
    expect(screen.queryByText(/Uncategorized/)).not.toBeInTheDocument();
  });

  it('renders duplicate test names without React key warnings', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderCard({
      failed_tests: { storage: ['test_a', 'test_a'] },
      tests_failures: 2,
      tests_run: 2,
    });

    expect(screen.getAllByText('test_a')).toHaveLength(2);
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('keeps the toggle usable', () => {
    const onToggle = jest.fn();
    render(
      <TestSuiteCard
        isExpanded={false}
        onToggle={onToggle}
        suiteData={{ failed_tests: { storage: ['test_a'] }, tests_failures: 1, tests_run: 2 }}
        suiteName="tier2"
      />,
    );

    fireEvent.click(screen.getByText('Failed tests (1)'));
    expect(onToggle).toHaveBeenCalled();
  });
});
