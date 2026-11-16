import { type FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, ExpandableSection } from '@patternfly/react-core';

import {
  normalizeFailedTests,
  parseFailedTestGroups,
  type SelfValidationSuiteResult,
} from '../../../utils';

type FailedTestsSectionProps = {
  failedTests: SelfValidationSuiteResult['failed_tests'];
  isExpanded: boolean;
  onToggle: () => void;
};

const FailedTestsSection: FC<FailedTestsSectionProps> = ({ failedTests, isExpanded, onToggle }) => {
  const { t } = useKubevirtTranslation();

  const {
    groups,
    isMalformed,
    total: failedTestsCount,
  } = useMemo(() => normalizeFailedTests(failedTests), [failedTests]);

  const parsedGroups = useMemo(() => parseFailedTestGroups(groups), [groups]);

  const showCategoryTitles =
    parsedGroups.length > 1 || parsedGroups.some(({ category }) => !!category);

  return (
    <>
      {isMalformed && (
        <Alert
          className="test-suite-card__failed-tests-error"
          isInline
          title={t('Unable to display failed tests')}
          variant={AlertVariant.danger}
        >
          {t(
            'The failed tests data for this suite has an unexpected format. Download the results to inspect the failed tests.',
          )}
        </Alert>
      )}

      {failedTestsCount > 0 && (
        <ExpandableSection
          isExpanded={isExpanded}
          onToggle={onToggle}
          toggleText={t('Failed tests ({{count}})', { count: failedTestsCount })}
        >
          <div className="test-suite-card__failed-tests-container">
            {parsedGroups.map(({ category, tests }) => (
              <div className="test-suite-card__failed-test-group" key={`category-${category}`}>
                {showCategoryTitles && (
                  <div className="test-suite-card__failed-test-category">
                    {category || t('Uncategorized')} ({tests.length})
                  </div>
                )}
                {tests.map(({ description, key, title }) => (
                  <div className="test-suite-card__failed-test-item" key={key}>
                    <div className="test-suite-card__failed-test-content">
                      <div className="test-suite-card__failed-test-body">
                        {title && <div className="test-suite-card__failed-test-title">{title}</div>}
                        <div className="test-suite-card__failed-test-description">
                          {description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}
    </>
  );
};

export default FailedTestsSection;
