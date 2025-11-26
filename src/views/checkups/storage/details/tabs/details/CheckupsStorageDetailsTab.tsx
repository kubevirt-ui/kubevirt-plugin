import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { Divider, PageSection } from '@patternfly/react-core';

import CheckupsDetailsPageHistory from '../../../../CheckupsDetailsPageHistory';
import { getJobByName } from '../../../../utils/utils';
import useCheckupsStorageData from '../../../components/hooks/useCheckupsStorageData';
import CheckupsStorageDetailsPageSection from '../../CheckupsStorageDetailsPageSection';

const CheckupsStorageDetailsTab: FC = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, error, jobs, loaded } = useCheckupsStorageData();

  const configMap = configMaps?.find((cm) => cm.metadata.name === checkupName);

  if (!configMap) {
    return null;
  }

  const jobMatches = getJobByName(jobs, configMap?.metadata?.name);

  return (
    <>
      <PageSection>
        <CheckupsStorageDetailsPageSection configMap={configMap} job={jobMatches?.[0]} />
      </PageSection>
      <PageSection>
        <Divider />
      </PageSection>
      <PageSection>
        <CheckupsDetailsPageHistory error={error} jobs={jobMatches} loaded={loaded} />
      </PageSection>
    </>
  );
};

export default CheckupsStorageDetailsTab;
