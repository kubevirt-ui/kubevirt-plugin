import React from 'react';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNotFound from '../../components/CheckupsNotFound';

import { useCheckupsSelfValidationTabs } from './hooks/useCheckupsSelfValidationTabs';
import useWatchCheckupData from './hooks/useWatchCheckupData';
import CheckupsSelfValidationDetailsPageHeader from './CheckupsSelfValidationDetailsPageHeader';

import './checkups-self-validation-details-page.scss';

const CheckupsSelfValidationDetailsPage = () => {
  const { configMap, error, jobMatches, loaded } = useWatchCheckupData();

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
