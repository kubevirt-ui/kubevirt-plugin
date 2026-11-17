import { type FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

import { parseFailedTestGroups, type SelfValidationSuiteResult } from '../../../utils';

type FailedTestsSectionProps = {
  failedTests: SelfValidationSuiteResult['failed_tests'];
  isExpanded: boolean;
  onToggle: () => void;
};

const FailedTestsSection: FC<FailedTestsSectionProps> = ({ failedTests, isExpanded, onToggle }) => {
  const { t } = useKubevirtTranslation();

  const parsedGroups = useMemo(() => parseFailedTestGroups(failedTests), [failedTests]);

  const failedTestsCount = useMemo(
    () => parsedGroups.reduce((sum, { tests }) => sum + tests.length, 0),
    [parsedGroups],
  );

  const showCategoryTitles =
    parsedGroups.length > 1 || parsedGroups.some(({ category }) => !!category);

  if (failedTestsCount === 0) return null;

  return (
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
                    <div className="test-suite-card__failed-test-description">{description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ExpandableSection>
  );
};

export default FailedTestsSection;
