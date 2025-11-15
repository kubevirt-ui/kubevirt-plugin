import React from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { getJobByName } from '../../utils/utils';
import useCheckupsSelfValidationData from '../components/hooks/useCheckupsSelfValidationData';

import { useCheckupsSelfValidationTabs } from './hooks/useCheckupsSelfValidationTabs';
import CheckupsSelfValidationDetailsPageHeader from './CheckupsSelfValidationDetailsPageHeader';

import './checkups-self-validation-details-page.scss';

const CheckupsSelfValidationDetailsPage = () => {
  const { vmName } = useParams<{ vmName: string }>();
  const { configMaps, jobs, pvcs } = useCheckupsSelfValidationData();

  const configMap = configMaps.find((cm) => cm.metadata.name === vmName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name, false);

  const pages = useCheckupsSelfValidationTabs();

  if (!configMap)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <>
      <CheckupsSelfValidationDetailsPageHeader
        configMap={configMap}
        jobs={jobMatches}
        pvcs={pvcs}
      />
      <HorizontalNav pages={pages} />
    </>
  );
};

export default CheckupsSelfValidationDetailsPage;
