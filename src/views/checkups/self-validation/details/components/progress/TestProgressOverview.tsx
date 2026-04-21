import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Card, CardBody, Spinner, Title } from '@patternfly/react-core';

import {
  TEST_STATUS_COMPLETED,
  TEST_STATUS_FAILED,
  TEST_STATUS_PENDING,
  TEST_STATUS_RUNNING,
} from '../../../utils';

import type { OverallProgress } from './utils/types';
import OverallProgressCard from './OverallProgressCard';
import TestSuiteProgressCard from './TestSuiteProgressCard';

import './progress-components.scss';

type TestProgressOverviewProps = {
  error: null | string;
  loading: boolean;
  progress: null | OverallProgress;
};

const TestProgressOverview: FC<TestProgressOverviewProps> = ({ error, loading, progress }) => {
  const { t } = useKubevirtTranslation();

  const sortedSuites = useMemo(() => {
    if (!progress?.suites) return [];

    const statusOrder = {
      [TEST_STATUS_COMPLETED]: 3,
      [TEST_STATUS_FAILED]: 3,
      [TEST_STATUS_PENDING]: 2,
      [TEST_STATUS_RUNNING]: 1,
    };

    return [...progress.suites].sort((a, b) => {
      const orderA = statusOrder[a.status] || 4;
      const orderB = statusOrder[b.status] || 4;
      return orderA - orderB;
    });
  }, [progress?.suites]);

  if (loading && !progress) {
    return (
      <Card>
        <CardBody>
          <div className="loading-container">
            <Spinner size="sm" />
            <span>{t('Loading test progress...')}</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert title={t('Error loading progress')} variant={AlertVariant.danger}>
        {error}
      </Alert>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardBody>
          <span>{t('No progress data available')}</span>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <OverallProgressCard progress={progress} />

      <div>
        <Title className="progress-card-spacing-md" headingLevel="h4">
          {t('Test suites')}
        </Title>
        {sortedSuites.map((suiteProgress) => (
          <TestSuiteProgressCard key={suiteProgress.suiteName} progress={suiteProgress} />
        ))}
      </div>
    </div>
  );
};

export default TestProgressOverview;
