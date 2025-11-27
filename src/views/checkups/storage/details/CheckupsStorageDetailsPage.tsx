import React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNotFound from '../../components/CheckupsNotFound';
import { getJobByName } from '../../utils/utils';
import useCheckupsStorageData from '../components/hooks/useCheckupsStorageData';

import { useCheckupsStorageTabs } from './hooks/useCheckupsStorageTabs';
import CheckupsStorageDetailsPageHeader from './CheckupsStorageDetailsPageHeader';

import './checkups-storage-details-page.scss';

const CheckupsStorageDetailsPage = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, error, jobs, loaded } = useCheckupsStorageData();

  const configMap = configMaps?.find((cm) => cm.metadata.name === checkupName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name);

  const pages = useCheckupsStorageTabs();
  const notFound = !configMap && loaded;

  return (
    <StateHandler error={error} hasData={!!configMap} loaded={loaded} withBullseye>
      <CheckupsStorageDetailsPageHeader configMap={configMap} jobs={jobMatches} />
      {configMap && <HorizontalNav pages={pages} />}
      {notFound && <CheckupsNotFound />}
    </StateHandler>
  );
};

export default CheckupsStorageDetailsPage;
