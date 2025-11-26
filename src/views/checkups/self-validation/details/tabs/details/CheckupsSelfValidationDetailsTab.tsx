import React, { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { Divider, PageSection } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import CheckupsDetailsPageHistory from '../../../../CheckupsDetailsPageHistory';
import { getJobByName } from '../../../../utils/utils';
import CheckupsSelfValidationHistoryActions from '../../../components/actions/CheckupsSelfValidationHistoryActions';
import useCheckupsSelfValidationData from '../../../components/hooks/useCheckupsSelfValidationData';
import useJobResults from '../../../components/hooks/useJobResults';
import useProgressTracking from '../../components/progress/hooks/useProgressTracking';
import TestProgressOverview from '../../components/progress/TestProgressOverview';

import CheckupsSelfValidationDetailsPageSection from './CheckupsSelfValidationDetailsPageSection';

const CheckupsSelfValidationDetailsTab: FC = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, error, jobs, loaded } = useCheckupsSelfValidationData();
  const configMap = configMaps?.find((cm) => cm.metadata.name === checkupName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name, false);
  const currentJob = jobMatches?.[0];

  const {
    error: resultsError,
    isLoading: isLoadingResults,
    results,
  } = useJobResults({
    job: currentJob,
    namespace: configMap?.metadata?.namespace || '',
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
    enabled: isJobRunning,
    job: currentJob,
    namespace: configMap?.metadata?.namespace || '',
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
          error={error}
          jobs={jobMatches}
          loaded={loaded && !isLoadingResults && !isProgressLoading}
          sortColumnIndex={2} //start time
          sortDirection={SortByDirection.desc}
        />
      </PageSection>
    </>
  );
};

export default CheckupsSelfValidationDetailsTab;
