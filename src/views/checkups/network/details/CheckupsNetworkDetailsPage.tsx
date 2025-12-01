import React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNotFound from '../../components/CheckupsNotFound';
import { getJobByName } from '../../utils/utils';
import useCheckupsNetworkData from '../hooks/useCheckupsNetworkData';

import { useCheckupsNetworkTabs } from './hooks/useCheckupsNetworkTabs';
import CheckupsNetworkDetailsPageHeader from './CheckupsNetworkDetailsPageHeader';

import './checkups-network-details-page.scss';

const CheckupsNetworkDetailsPage = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, error, jobs, loaded } = useCheckupsNetworkData();

  const configMap = configMaps?.find((cm) => cm.metadata.name === checkupName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name);

  const pages = useCheckupsNetworkTabs();
  const notFound = !configMap && loaded;

  return (
    <StateHandler error={error} hasData={!!configMap} loaded={loaded} withBullseye>
      <CheckupsNetworkDetailsPageHeader configMap={configMap} jobs={jobMatches} />
      {configMap && <HorizontalNav pages={pages} />}
      {notFound && <CheckupsNotFound />}
    </StateHandler>
  );
};

export default CheckupsNetworkDetailsPage;
