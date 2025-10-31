import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ExpandableSection,
  Tooltip,
} from '@patternfly/react-core';
import { BanIcon, InfoCircleIcon } from '@patternfly/react-icons';

import TestStatistics from '../../../components/shared/TestStatistics';
import { COLOR_SKIPPED, formatGoDuration, parseFailedTest } from '../../../utils';
import { getTestSuiteLabel } from '../../components/progress/utils/progressTracker';

export interface TestSuiteData {
  failed_tests?: string[];
  tests_duration?: string;
  tests_failures?: string;
  tests_passed?: string;
  tests_run?: string;
  tests_skipped?: string;
}

type TestSuiteCardProps = {
  isExpanded: boolean;
  onToggle: () => void;
  suiteData: TestSuiteData;
  suiteName: string;
};

const TestSuiteCard: FC<TestSuiteCardProps> = ({ isExpanded, onToggle, suiteData, suiteName }) => {
  const { t } = useKubevirtTranslation();

  const totalTests = Number(suiteData.tests_run) || 0;
  const testsFailed = Number(suiteData.tests_failures) || 0;
  const testsPassed = Number(suiteData.tests_passed) || 0;
  const testsSkipped = Number(suiteData.tests_skipped) || 0;

  const failedTests = useMemo(() => suiteData.failed_tests || [], [suiteData.failed_tests]);
  const testDuration = useMemo(
    () => formatGoDuration(suiteData.tests_duration),
    [suiteData.tests_duration],
  );

  const parsedFailedTests = useMemo(
    () => failedTests.map((testName: string) => ({ testName, ...parseFailedTest(testName) })),
    [failedTests],
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
        icon: <BanIcon style={{ color: COLOR_SKIPPED }} />,
        label: t('Skipped'),
        skippedStatusMessage: (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 'var(--pf-t--global--spacer--xs)',
              justifyContent: 'center',
            }}
          >
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
  }, [testsFailed, totalTests, testsPassed, t]);

  const { icon: statusIcon, label: statusLabel, skippedStatusMessage } = getStatusDetails;

  return (
    <Card className="CheckupsSelfValidationTestSuiteCard" isDisabled={!!skippedStatusMessage}>
      <CardHeader>
        <CardTitle>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 'var(--pf-t--global--spacer--sm)',
              marginBottom: 'var(--pf-t--global--spacer--md)',
            }}
          >
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
          <div
            style={{
              color: COLOR_SKIPPED,
              textAlign: 'center',
            }}
          >
            {skippedStatusMessage}
          </div>
        )}
      </CardHeader>
      {!skippedStatusMessage && (
        <CardBody>
          <div>
            <strong>{t('Duration')}</strong> {testDuration}
          </div>

          {failedTests.length > 0 && (
            <ExpandableSection
              isExpanded={isExpanded}
              onToggle={onToggle}
              toggleText={t('Failed tests ({{count}})', { count: failedTests.length })}
            >
              <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                {parsedFailedTests.map(({ description, testName, title }) => (
                  <div
                    style={{
                      marginBottom: 'var(--pf-t--global--spacer--sm)',
                      padding: 'var(--pf-t--global--spacer--sm)',
                    }}
                    key={`failed-${testName}`}
                  >
                    <div
                      style={{
                        alignItems: 'flex-start',
                        display: 'flex',
                        gap: 'var(--pf-t--global--spacer--sm)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {title && (
                          <div
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              marginBottom: 'var(--pf-t--global--spacer--xs)',
                            }}
                          >
                            {title}
                          </div>
                        )}
                        <div
                          style={{
                            fontFamily: 'monospace',
                            lineHeight: '1.4',
                          }}
                        >
                          {description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}
        </CardBody>
      )}
    </Card>
  );
};

export default TestSuiteCard;
