import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Divider, PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import useCheckupsNetworkData from '../hooks/useCheckupsNetworkData';
import { getJobByName } from '../utils/utils';

import CheckupsNetworkDetailsPageHeader from './CheckupsNetworkDetailsPageHeader';
import CheckupsNetworkDetailsPageHistory from './CheckupsNetworkDetailsPageHistory';
import CheckupsNetworkDetailsPageSection from './CheckupsNetworkDetailsPageSection';

import './checkups-network-details-page.scss';

const CheckupsNetworkDetailsPage = () => {
  const { vmName } = useParams<{ vmName: string }>();
  const { t } = useKubevirtTranslation();
  const { configMaps, error, jobs, loading } = useCheckupsNetworkData();
  const [activeTabKey, setActiveTabKey] = useState<number>(0);

  const configMap = configMaps.find((cm) => cm.metadata.name === vmName);
  const jobMatches = getJobByName(jobs, configMap?.metadata?.name);

  if (!configMap)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <PageSection>
      <CheckupsNetworkDetailsPageHeader configMap={configMap} />
      <Tabs
        onSelect={(_, tabIndex: number) => {
          setActiveTabKey(tabIndex);
        }}
        activeKey={activeTabKey}
      >
        <Tab eventKey={0} title={<TabTitleText>{t('Details')}</TabTitleText>}>
          <PageSection>
            <CheckupsNetworkDetailsPageSection configMap={configMap} job={jobMatches?.[0]} />
          </PageSection>
          <PageSection>
            <Divider />
          </PageSection>
          <PageSection>
            <CheckupsNetworkDetailsPageHistory error={error} jobs={jobMatches} loading={loading} />
          </PageSection>
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('YAML')}</TabTitleText>}>
          <ResourceYAMLEditor initialResource={configMap} />
        </Tab>
      </Tabs>
    </PageSection>
  );
};

export default CheckupsNetworkDetailsPage;
