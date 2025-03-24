import React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { getJobByName } from '../../utils/utils';
import useCheckupsNetworkData from '../hooks/useCheckupsNetworkData';

import { useCheckupsNetworkTabs } from './hooks/useCheckupsNetworkTabs';
import CheckupsNetworkDetailsPageHeader from './CheckupsNetworkDetailsPageHeader';

import './checkups-network-details-page.scss';

const CheckupsNetworkDetailsPage = () => {
  const { vmName } = useParams<{ vmName: string }>();
  const { configMaps, jobs } = useCheckupsNetworkData();

  const configMap = configMaps.find((cm) => cm.metadata.name === vmName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name);

  const pages = useCheckupsNetworkTabs();

  if (!configMap)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <>
      <CheckupsNetworkDetailsPageHeader configMap={configMap} jobs={jobMatches} />
      <HorizontalNav pages={pages} />
    </>
  );
};

export default CheckupsNetworkDetailsPage;
