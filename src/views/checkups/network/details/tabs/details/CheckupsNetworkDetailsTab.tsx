import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';
import CheckupsDetailsPageHistory from 'src/views/checkups/CheckupsDetailsPageHistory';
import { getJobByName } from 'src/views/checkups/utils/utils';

import { Divider, PageSection } from '@patternfly/react-core';

import useCheckupsNetworkData from '../../../hooks/useCheckupsNetworkData';

import CheckupsNetworkDetailsPageSection from './CheckupsNetworkDetailsPageSection';

const CheckupsNetworkDetailsTab: FC = () => {
  const { vmName } = useParams<{ vmName: string }>();
  const { configMaps, error, jobs, loading } = useCheckupsNetworkData();

  const configMap = configMaps.find((cm) => cm.metadata.name === vmName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name);

  return (
    <>
      <CheckupsNetworkDetailsPageSection configMap={configMap} job={jobMatches?.[0]} />
      <PageSection>
        <Divider />
      </PageSection>
      <PageSection>
        <CheckupsDetailsPageHistory error={error} jobs={jobMatches} loading={loading} />
      </PageSection>
    </>
  );
};

export default CheckupsNetworkDetailsTab;
