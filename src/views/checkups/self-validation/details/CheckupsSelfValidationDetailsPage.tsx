import React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNotFound from '../../components/CheckupsNotFound';
import { getJobByName } from '../../utils/utils';
import useCheckupsSelfValidationData from '../components/hooks/useCheckupsSelfValidationData';

import { useCheckupsSelfValidationTabs } from './hooks/useCheckupsSelfValidationTabs';
import CheckupsSelfValidationDetailsPageHeader from './CheckupsSelfValidationDetailsPageHeader';

import './checkups-self-validation-details-page.scss';

const CheckupsSelfValidationDetailsPage = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps, error, jobs, loaded } = useCheckupsSelfValidationData();

  const configMap = configMaps?.find((cm) => cm.metadata.name === checkupName);
  const jobMatches = configMap ? getJobByName(jobs, configMap.metadata.name, false) : [];

  const pages = useCheckupsSelfValidationTabs();
  const notFound = !configMap && loaded;

  return (
    <StateHandler error={error} hasData={!!configMap} loaded={loaded} withBullseye>
      <CheckupsSelfValidationDetailsPageHeader configMap={configMap} jobs={jobMatches} />
      {configMap && <HorizontalNav pages={pages} />}
      {notFound && <CheckupsNotFound />}
    </StateHandler>
  );
};

export default CheckupsSelfValidationDetailsPage;
