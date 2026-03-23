import React, { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import ConfigurationSearch from '@kubevirt-utils/components/ConfigurationSearch/ConfigurationSearch';
import GuidedTour from '@kubevirt-utils/components/GuidedTour/GuidedTour';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespacePathSegment } from '@kubevirt-utils/utils/utils';
import { DocumentTitle, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Breadcrumb,
  BreadcrumbItem,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useFleetClusterNames, useHubClusterName } from '@stolostron/multicluster-sdk';

import { SettingsClusterProvider } from './context/SettingsClusterContext';
import { createSettingsSearchURL, SEARCH_ITEMS } from './search/search';
import SettingsTab from './SettingsTab';

import './SettingsPage.scss';

const SettingsPage: FC = () => {
  useSignals();

  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [clusterNames, clustersLoaded] = useFleetClusterNames();
  const [hubClusterName] = useHubClusterName();
  const [selectedCluster, setSelectedCluster] = useState<string>();

  const showClusterDropdown = clusterNames?.length > 1;
  const activeCluster = selectedCluster || hubClusterName;

  const contextCluster =
    activeCluster && activeCluster !== hubClusterName ? activeCluster : undefined;

  const onClusterChange = useCallback((cluster: string) => {
    setSelectedCluster(cluster);
  }, []);

  if (!clustersLoaded) {
    return <LoadingEmptyState />;
  }

  return (
    <>
      <DocumentTitle>{t('Settings')}</DocumentTitle>
      <div className="settings-page__layout">
        <div className="settings-page__sticky-header">
          <PageSection className="settings-page__header" hasBodyWrapper={false}>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link
                  to={`/k8s/${getNamespacePathSegment(activeNamespace)}/${
                    VIRTUALIZATION_PATHS.OVERVIEW
                  }`}
                >
                  {t('Virtualization')}
                </Link>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{t('Settings')}</BreadcrumbItem>
            </Breadcrumb>
            <Title
              className="settings-page__title"
              data-test-id="settings-page-title"
              headingLevel="h1"
            >
              {t('Settings')}
            </Title>
            <Content component={ContentVariants.p}>
              {t(
                'Manage configurations at both the cluster and user levels, or opt-in to experimental features.',
              )}
            </Content>
          </PageSection>
          <PageSection className="settings-page__toolbar" hasBodyWrapper={false}>
            <Grid hasGutter>
              {showClusterDropdown && (
                <GridItem className="settings-page__cluster-selector" span={4}>
                  {t('Cluster')}:
                  <ClusterDropdown
                    includeAllClusters={false}
                    onChange={onClusterChange}
                    selectedCluster={activeCluster}
                  />
                </GridItem>
              )}
              <GridItem span={showClusterDropdown ? 8 : 12}>
                <ConfigurationSearch
                  createSearchURL={createSettingsSearchURL}
                  placeholder={showClusterDropdown ? t('Find in selected cluster') : undefined}
                  searchItems={SEARCH_ITEMS}
                />
              </GridItem>
            </Grid>
          </PageSection>
        </div>
        <PageSection className="settings-page__content" hasBodyWrapper={false} isWidthLimited>
          <SettingsClusterProvider cluster={contextCluster} key={activeCluster ?? 'hub'}>
            <SettingsTab />
          </SettingsClusterProvider>
        </PageSection>
        <GuidedTour />
      </div>
    </>
  );
};

export default SettingsPage;
