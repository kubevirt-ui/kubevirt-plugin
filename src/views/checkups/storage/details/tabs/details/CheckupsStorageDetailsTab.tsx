import React, { type FC, type JSX } from 'react';
import { useParams } from 'react-router';

import { getName } from '@kubevirt-utils/resources/shared';
import { Divider, PageSection } from '@patternfly/react-core';

import CheckupsDetailsPageHistory from '../../../../CheckupsDetailsPageHistory';
import { getJobByName } from '../../../../utils/utils';
import useCheckupsStorageData from '../../../components/hooks/useCheckupsStorageData';
import CheckupsStorageDetailsPageSection from '../../CheckupsStorageDetailsPageSection';

const CheckupsStorageDetailsTab: FC = (): JSX.Element | null => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, error, jobs, loaded } = useCheckupsStorageData();

  const configMap = configMaps?.find((configMapItem) => getName(configMapItem) === checkupName);

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
        <CheckupsDetailsPageHistory
          checkupName={checkupName}
          error={error}
          jobs={jobMatches ?? []}
          loaded={loaded}
        />
      </PageSection>
    </>
  );
};

export default CheckupsStorageDetailsTab;
