import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Divider, PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import CheckupsDetailsPageHistory from '../../CheckupsDetailsPageHistory';
import { getJobByName } from '../../utils/utils';
import useCheckupsStorageData from '../components/hooks/useCheckupsStorageData';

import CheckupsStorageDetailsPageHeader from './CheckupsStorageDetailsPageHeader';
import CheckupsStorageDetailsPageSection from './CheckupsStorageDetailsPageSection';

import './checkups-storage-details-page.scss';

const CheckupsStorageDetailsPage = () => {
  const { vmName } = useParams<{ vmName: string }>();
  const { t } = useKubevirtTranslation();
  const { configMaps, error, jobs, loading } = useCheckupsStorageData();
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
      <CheckupsStorageDetailsPageHeader configMap={configMap} jobs={jobMatches} />
      <Tabs
        onSelect={(_, tabIndex: number) => {
          setActiveTabKey(tabIndex);
        }}
        activeKey={activeTabKey}
      >
        <Tab eventKey={0} title={<TabTitleText>{t('Details')}</TabTitleText>}>
          <PageSection>
            <CheckupsStorageDetailsPageSection configMap={configMap} job={jobMatches?.[0]} />
          </PageSection>
          <PageSection>
            <Divider />
          </PageSection>
          <PageSection>
            <CheckupsDetailsPageHistory error={error} jobs={jobMatches} loading={loading} />
          </PageSection>
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('YAML')}</TabTitleText>}>
          <ResourceYAMLEditor initialResource={configMap} />
        </Tab>
      </Tabs>
    </PageSection>
  );
};

export default CheckupsStorageDetailsPage;
