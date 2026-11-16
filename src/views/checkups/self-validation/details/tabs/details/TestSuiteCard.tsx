import { type FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardHeader, CardTitle, Tooltip } from '@patternfly/react-core';
import { BanIcon, InfoCircleIcon } from '@patternfly/react-icons';

import TestStatistics from '../../../components/shared/TestStatistics';
import { formatGoDuration, type SelfValidationSuiteResult } from '../../../utils';
import { getTestSuiteLabel } from '../../components/progress/utils/progressTracker';
import FailedTestsSection from './FailedTestsSection';

import './TestSuiteCard.scss';

export type TestSuiteData = SelfValidationSuiteResult;

type TestSuiteCardProps = {
  isExpanded: boolean;
  onToggle: () => void;
  suiteData: TestSuiteData;
  suiteName: string;
};

const TestSuiteCard: FC<TestSuiteCardProps> = ({ isExpanded, onToggle, suiteData, suiteName }) => {
  const { t } = useKubevirtTranslation();

  const totalTests = suiteData.tests_run ?? 0;
  const testsFailed = suiteData.tests_failures ?? 0;
  const testsPassed = suiteData.tests_passed ?? 0;
  const testsSkipped = suiteData.tests_skipped ?? 0;

  const testDuration = useMemo(
    () => formatGoDuration(suiteData.tests_duration),
    [suiteData.tests_duration],
  );

  const getStatusDetails = useMemo(() => {
    if (testsFailed > 0) {
      return {
        icon: <RedExclamationCircleIcon />,
        label: t('Failed'),
        skippedStatusMessage: null,
      };
    }

    if (totalTests === 0 || totalTests === testsSkipped) {
      return {
        icon: <BanIcon className="icon-color-skipped" />,
        label: t('Skipped'),
        skippedStatusMessage: (
          <div className="test-suite-card__skipped-message-content">
            <InfoCircleIcon />
            <span>{t('This suite was skipped.')}</span>
          </div>
        ),
      };
    }
    return {
      icon: <GreenCheckCircleIcon />,
      label: t('Completed successfully'),
      skippedStatusMessage: null,
    };
  }, [testsFailed, totalTests, testsSkipped, t]);

  const { icon: statusIcon, label: statusLabel, skippedStatusMessage } = getStatusDetails;

  return (
    <Card className="CheckupsSelfValidationTestSuiteCard" isDisabled={!!skippedStatusMessage}>
      <CardHeader>
        <CardTitle>
          <div className="test-suite-card__header-title">
            <Tooltip content={statusLabel}>{statusIcon}</Tooltip>
            <span>
              {getTestSuiteLabel(suiteName)} {t('tests')}
            </span>
          </div>
          {!skippedStatusMessage && (
            <TestStatistics
              failed={testsFailed}
              passed={testsPassed}
              size="medium"
              skipped={testsSkipped}
              total={totalTests}
            />
          )}
        </CardTitle>
        {skippedStatusMessage && (
          <div className="test-suite-card__skipped-message">{skippedStatusMessage}</div>
        )}
      </CardHeader>
      {!skippedStatusMessage && (
        <CardBody>
          <div>
            <strong>{t('Duration')}</strong> {testDuration}
          </div>

          <FailedTestsSection
            failedTests={suiteData.failed_tests}
            isExpanded={isExpanded}
            onToggle={onToggle}
          />
        </CardBody>
      )}
    </Card>
  );
};

export default TestSuiteCard;
