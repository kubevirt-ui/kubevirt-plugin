import React, { FCC, useCallback } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Divider, PageSection } from '@patternfly/react-core';

import CheckupsDetailsPageHistory from '../../../../CheckupsDetailsPageHistory';
import { CHECKUPS_COLUMN_KEYS } from '../../../../utils/constants';
import CheckupsSelfValidationHistoryActions from '../../../components/actions/CheckupsSelfValidationHistoryActions';
import useJobResults from '../../../components/hooks/useJobResults';
import useProgressTracking from '../../components/progress/hooks/useProgressTracking';
import TestProgressOverview from '../../components/progress/TestProgressOverview';
import useWatchCheckupData from '../../hooks/useWatchCheckupData';

import CheckupsSelfValidationDetailsPageSection from './CheckupsSelfValidationDetailsPageSection';

const CheckupsSelfValidationDetailsTab: FCC = () => {
  const { configMap, error, jobMatches, loaded } = useWatchCheckupData();
  const currentJob = jobMatches?.[0];

  const {
    error: resultsError,
    isLoading: isLoadingResults,
    results,
  } = useJobResults({
    cluster: getCluster(configMap),
    job: currentJob,
    namespace: getNamespace(configMap) || '',
  });

  const isJobRunning = currentJob && !currentJob.status?.succeeded && !currentJob.status?.failed;
  const isJobCompleted = !!(
    currentJob &&
    (currentJob.status?.succeeded === 1 || currentJob.status?.failed === 1)
  );

  const {
    error: progressError,
    loading: isProgressLoading,
    progress,
  } = useProgressTracking({
    cluster: getCluster(configMap),
    enabled: isJobRunning,
    job: currentJob,
    namespace: getNamespace(configMap) || '',
  });

  const renderCustomActions = useCallback(
    (job: IoK8sApiBatchV1Job) => <CheckupsSelfValidationHistoryActions job={job} />,
    [],
  );

  return (
    <>
      <CheckupsSelfValidationDetailsPageSection
        configMap={configMap}
        error={resultsError}
        isJobCompleted={isJobCompleted}
        job={currentJob}
        loading={isLoadingResults}
        results={results}
      />

      {isJobRunning && (
        <PageSection>
          <TestProgressOverview
            error={progressError}
            loading={isProgressLoading}
            progress={progress}
          />
        </PageSection>
      )}

      <PageSection>
        <Divider />
      </PageSection>
      <PageSection>
        <CheckupsDetailsPageHistory
          customActions={renderCustomActions}
          error={error instanceof Error ? error : undefined}
          initialSortDirection="desc"
          initialSortKey={CHECKUPS_COLUMN_KEYS.START_TIME}
          jobs={jobMatches ?? []}
          loaded={loaded && !isLoadingResults && !isProgressLoading}
        />
      </PageSection>
    </>
  );
};

export default CheckupsSelfValidationDetailsTab;
