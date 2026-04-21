import React, { FC } from 'react';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';

import { CheckupsStatus, getJobStatus } from '../../../../utils/utils';
import TestStatistics from '../../../components/shared/TestStatistics';
import {
  JobResults,
  TOTAL_TESTS_FAILED_KEY,
  TOTAL_TESTS_PASSED_KEY,
  TOTAL_TESTS_RUN_KEY,
  TOTAL_TESTS_SKIPPED_KEY,
} from '../../../utils';

import CheckupsSelfValidationDetailsDescriptionList from './components/CheckupsSelfValidationDetailsDescriptionList';
import { useExpandedSections } from './hooks/useExpandedSections';
import { useFilteredTestSuites } from './hooks/useFilteredTestSuites';
import TestSuiteCard from './TestSuiteCard';

import '../../checkups-self-validation-details-page.scss';

type CheckupsSelfValidationDetailsPageSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  error: null | string;
  isJobCompleted?: boolean;
  job: IoK8sApiBatchV1Job;
  loading: boolean;
  results: JobResults | null;
};

const CheckupsSelfValidationDetailsPageSection: FC<
  CheckupsSelfValidationDetailsPageSectionProps
> = ({ configMap, error, isJobCompleted, job, loading, results }) => {
  const { t } = useKubevirtTranslation();
  const { expandedSections, toggleSection } = useExpandedSections();
  const filteredTestSuites = useFilteredTestSuites(results);
  const isJobFailed = getJobStatus(job) === CheckupsStatus.Failed;

  if (loading) {
    return (
      <PageSection>
        <Card>
          <CardBody>
            <div className="center-content">
              <Spinner size="md" />
            </div>
          </CardBody>
        </Card>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection>
        <Card>
          <CardBody>
            <div className="center-content-error">
              <div>{error}</div>
            </div>
          </CardBody>
        </Card>
      </PageSection>
    );
  }

  if (!configMap) {
    return (
      <PageSection>
        <div>{t('Checkup not found')}</div>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Self validation checkup details')}
      </Title>
      <CheckupsSelfValidationDetailsDescriptionList
        configMap={configMap}
        error={error}
        isJobCompleted={isJobCompleted}
        isJobFailed={isJobFailed}
        job={job}
        loading={loading}
        results={results}
      />
      {!results && isJobCompleted && (
        <PageSection>
          <Card>
            <CardBody>
              <div className="center-content">
                <div>{t('No results available')}</div>
              </div>
            </CardBody>
          </Card>
        </PageSection>
      )}
      {results?.tests && (
        <div className="test-results-section">
          <Title className="co-section-heading" headingLevel="h3">
            {t('Test results')}
          </Title>

          {results.tests.summary && (
            <Card className="summary-card">
              <CardHeader>
                <CardTitle>{t('Summary')}</CardTitle>
              </CardHeader>
              <CardBody>
                <TestStatistics
                  failed={results.tests.summary[TOTAL_TESTS_FAILED_KEY]}
                  passed={results.tests.summary[TOTAL_TESTS_PASSED_KEY]}
                  size="large"
                  skipped={results.tests.summary[TOTAL_TESTS_SKIPPED_KEY]}
                  total={results.tests.summary[TOTAL_TESTS_RUN_KEY]}
                />
              </CardBody>
            </Card>
          )}

          <div className="test-results-container">
            {filteredTestSuites.map(([suiteName, suiteData]) => (
              <TestSuiteCard
                isExpanded={expandedSections[suiteName]}
                key={suiteName}
                onToggle={() => toggleSection(suiteName)}
                suiteData={suiteData}
                suiteName={suiteName}
              />
            ))}
          </div>
        </div>
      )}
    </PageSection>
  );
};

export default CheckupsSelfValidationDetailsPageSection;
