import { type FC, useMemo } from 'react';

import { useClusterObservabilityDisabled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterObservabilityDisabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Alert, Bullseye, PageSection, Spinner, Stack } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import FleetVMInventoryBanner from '../FleetVMInventoryBanner';

import OverviewAlerts from './components/OverviewAlerts';
import { determineOverviewLevel, getOverviewConfig } from './config';
import { KubeVirtOverviewClusterCsvProvider } from './context/KubeVirtOverviewClusterCsvContext';
import useFolderFilter from './hooks/useFolderFilter';
import useOverviewVMData from './hooks/useOverviewVMData';
import { OVERVIEW_LEVEL_PROJECT, type OverviewTabProps } from './types';

const OverviewTab: FC<OverviewTabProps> = ({ cluster, namespace }) => {
  useSignals();
  const { t } = useKubevirtTranslation();

  const isACMPage = useIsACMPage();
  const isMultiCluster = useIsAllClustersPage();
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();
  const { error, isSoftError, refresh, vms, vmsLoaded } = useOverviewVMData(namespace, cluster);

  const {
    disabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
    mcoInstalled,
  } = useClusterObservabilityDisabled(true);

  const { filteredVMs, vmNames } = useFolderFilter(vms);

  const overviewLevel = useMemo(
    () => determineOverviewLevel(namespace, isMultiCluster),
    [namespace, isMultiCluster],
  );

  const config = useMemo(() => getOverviewConfig(overviewLevel, t), [overviewLevel, t]);

  const isManagedClusterFetch =
    isACMPage && !!cluster && hubClusterLoaded && hubClusterName !== cluster;
  const isManagedClusterDisabled = isManagedClusterFetch && disabledClusters.includes(cluster);

  const metricsUnavailable =
    isACMPage && observabilityLoaded && (!mcoInstalled || isManagedClusterDisabled);

  const sectionData = useMemo(
    () => ({
      cluster,
      metricsUnavailable,
      namespace,
      vmNames,
      vms: filteredVMs,
    }),
    [cluster, metricsUnavailable, namespace, filteredVMs, vmNames],
  );

  if (error && !isSoftError) {
    return (
      <PageSection>
        <Alert title={t('Error loading virtual machines')} variant="danger">
          {error.message || t('An unknown error occurred')}
        </Alert>
      </PageSection>
    );
  }

  if (!vmsLoaded) {
    return (
      <PageSection>
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      </PageSection>
    );
  }

  const hasNoVMs = vms?.length === 0;

  return (
    <PageSection data-test="dashboard">
      <Stack data-test="vm-list-summary" hasGutter>
        <FleetVMInventoryBanner
          error={isSoftError ? error : undefined}
          hasInventory={!hasNoVMs}
          onRetry={refresh}
        />
        <OverviewAlerts
          cluster={cluster}
          disabledClusters={disabledClusters}
          hasNoVMs={hasNoVMs}
          isAllClustersPage={isMultiCluster}
          mcoInstalled={mcoInstalled}
          namespace={namespace}
          observabilityError={observabilityError}
          observabilityLoaded={observabilityLoaded}
        />
        {overviewLevel === OVERVIEW_LEVEL_PROJECT ? (
          config.sections.map((section) => (
            <section.Component
              key={section.id}
              {...sectionData}
              subHeader={section.subHeader}
              title={section.title}
            />
          ))
        ) : (
          <KubeVirtOverviewClusterCsvProvider cluster={cluster}>
            {config.sections.map((section) => (
              <section.Component
                key={section.id}
                {...sectionData}
                subHeader={section.subHeader}
                title={section.title}
              />
            ))}
          </KubeVirtOverviewClusterCsvProvider>
        )}
      </Stack>
    </PageSection>
  );
};

export default OverviewTab;
