import React, { FC, useCallback, useMemo, useState } from 'react';
import CheckupsStatusIcon from 'src/views/checkups/CheckupsStatusIcon';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  Grid,
  GridItem,
  PageSection,
  Spinner,
  Title,
} from '@patternfly/react-core';

import { STATUS_COMPLETION_TIME_STAMP, STATUS_START_TIME_STAMP } from '../../../../utils/utils';
import TestStatistics from '../../../components/shared/TestStatistics';
import {
  TOTAL_TESTS_FAILED_KEY,
  TOTAL_TESTS_PASSED_KEY,
  TOTAL_TESTS_RUN_KEY,
  TOTAL_TESTS_SKIPPED_KEY,
} from '../../../utils';

import { ResultsStatus } from './ResultsStatus';
import TestSuiteCard from './TestSuiteCard';

import '../../checkups-self-validation-details-page.scss';

type CheckupsSelfValidationDetailsPageSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  error: null | string;
  isJobCompleted?: boolean;
  job: IoK8sApiBatchV1Job;
  loading: boolean;
  results: { [suiteName: string]: any } | null;
};

const CheckupsSelfValidationDetailsPageSection: FC<
  CheckupsSelfValidationDetailsPageSectionProps
> = ({ configMap, error, isJobCompleted, job, loading, results }) => {
  const { t } = useKubevirtTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const isJobFailed = job && job.status?.failed === 1;
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const filteredTestSuites = useMemo(() => {
    if (!results?.tests) return [];
    return Object.entries(results.tests).filter(([key]) => key !== 'summary');
  }, [results?.tests]);

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
      <Grid>
        <GridItem span={6}>
          <DescriptionList>
            <VirtualMachineDescriptionItem
              descriptionData={configMap?.metadata?.name}
              descriptionHeader={t('Name')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <CheckupsStatusIcon configMap={configMap} job={job} onlyJob={true} />
              }
              descriptionHeader={t('Status')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <Timestamp
                  timestamp={
                    results?.timestamps?.startTimestamp ||
                    configMap?.data?.[STATUS_START_TIME_STAMP] ||
                    NO_DATA_DASH
                  }
                />
              }
              descriptionHeader={t('Start time')}
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <VirtualMachineDescriptionItem
              descriptionData={
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                  name={configMap?.metadata?.namespace}
                />
              }
              descriptionHeader={t('Namespace')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                isJobCompleted ? (
                  <ResultsStatus
                    isJobFailed={isJobFailed}
                    isLoadingResults={loading}
                    isResultsError={!!error}
                  />
                ) : (
                  NO_DATA_DASH
                )
              }
              descriptionHeader={t('Results')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={
                <Timestamp
                  timestamp={
                    results?.timestamps?.completionTimestamp ||
                    configMap?.data?.[STATUS_COMPLETION_TIME_STAMP] ||
                    NO_DATA_DASH
                  }
                />
              }
              descriptionHeader={t('Completion time')}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
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
