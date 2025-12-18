import React, { FC } from 'react';
import CheckupsStatusIcon from 'src/views/checkups/CheckupsStatusIcon';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import { STATUS_COMPLETION_TIME_STAMP, STATUS_START_TIME_STAMP } from '../../../../../utils/utils';
import { JobResults } from '../../../../utils';
import ResultsStatus from '../ResultsStatus';

type CheckupsSelfValidationDetailsDescriptionListProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  error: null | string;
  isJobCompleted?: boolean;
  isJobFailed: boolean;
  job: IoK8sApiBatchV1Job;
  loading: boolean;
  results: JobResults | null;
};

const CheckupsSelfValidationDetailsDescriptionList: FC<
  CheckupsSelfValidationDetailsDescriptionListProps
> = ({ configMap, error, isJobCompleted, isJobFailed, job, loading, results }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid>
      <GridItem span={6}>
        <DescriptionList>
          <DescriptionItem
            descriptionData={configMap?.metadata?.name}
            descriptionHeader={t('Name')}
          />
          <DescriptionItem
            descriptionData={<CheckupsStatusIcon configMap={configMap} job={job} onlyJob={true} />}
            descriptionHeader={t('Status')}
          />
          <DescriptionItem
            descriptionData={
              <Timestamp
                timestamp={
                  results?.timestamps?.startTimestamp || configMap?.data?.[STATUS_START_TIME_STAMP]
                }
              />
            }
            descriptionHeader={t('Start time')}
          />
        </DescriptionList>
      </GridItem>
      <GridItem span={6}>
        <DescriptionList>
          <DescriptionItem
            descriptionData={
              <MulticlusterResourceLink
                cluster={getCluster(configMap)}
                groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                name={configMap?.metadata?.namespace}
              />
            }
            descriptionHeader={t('Namespace')}
          />
          <DescriptionItem
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
          <DescriptionItem
            descriptionData={
              <Timestamp
                timestamp={
                  results?.timestamps?.completionTimestamp ||
                  configMap?.data?.[STATUS_COMPLETION_TIME_STAMP]
                }
              />
            }
            descriptionHeader={t('Completion time')}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default CheckupsSelfValidationDetailsDescriptionList;
