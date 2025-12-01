import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';
import CheckupsDetailsPageHistory from 'src/views/checkups/CheckupsDetailsPageHistory';
import { getJobByName } from 'src/views/checkups/utils/utils';

import { Divider, PageSection } from '@patternfly/react-core';

import useCheckupsNetworkData from '../../../hooks/useCheckupsNetworkData';

import CheckupsNetworkDetailsPageSection from './CheckupsNetworkDetailsPageSection';

const CheckupsNetworkDetailsTab: FC = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, error, jobs, loaded } = useCheckupsNetworkData();

  const configMap = configMaps.find((cm) => cm.metadata.name === checkupName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name);

  return (
    <>
      <CheckupsNetworkDetailsPageSection configMap={configMap} job={jobMatches?.[0]} />
      <PageSection>
        <Divider />
      </PageSection>
      <PageSection>
        <CheckupsDetailsPageHistory error={error} jobs={jobMatches} loaded={loaded} />
      </PageSection>
    </>
  );
};

export default CheckupsNetworkDetailsTab;
