import React, { FC, useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useClusterObservabilityDisabled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterObservabilityDisabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Alert, Bullseye, PageSection, Spinner, Stack } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { AdvancedSearchFilter, useHubClusterName } from '@stolostron/multicluster-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import OverviewAlerts from './components/OverviewAlerts';
import useFolderFilter from './hooks/useFolderFilter';
import { determineOverviewLevel, getOverviewConfig } from './config';
import { OverviewTabProps } from './types';

const OverviewTab: FC<OverviewTabProps> = ({ cluster, namespace }) => {
  useSignals();
  const { t } = useKubevirtTranslation();

  const isMultiCluster = useIsAllClustersPage();
  const isACMPage = useIsACMPage();
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();

  const {
    disabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
    mcoInstalled,
  } = useClusterObservabilityDisabled(true);

  const isManagedClusterFetch =
    isACMPage && !!cluster && hubClusterLoaded && hubClusterName !== cluster;

  const searchQueries = useMemo<AdvancedSearchFilter | undefined>(
    () => (isManagedClusterFetch ? [{ property: 'cluster', values: [cluster] }] : undefined),
    [isManagedClusterFetch, cluster],
  );

  const watchEnabled = !isACMPage || !cluster || hubClusterLoaded;

  const [vms, vmsLoaded, vmsError] = useKubevirtWatchResource<V1VirtualMachine[]>(
    watchEnabled
      ? {
          cluster: isManagedClusterFetch ? undefined : cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
          namespace,
          namespaced: !!namespace,
        }
      : null,
    undefined,
    searchQueries,
  );

  const { filteredVMs, vmNames } = useFolderFilter(vms);

  const overviewLevel = useMemo(
    () => determineOverviewLevel(namespace, isMultiCluster),
    [namespace, isMultiCluster],
  );

  const config = useMemo(() => getOverviewConfig(overviewLevel, t), [overviewLevel, t]);

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

  if (vmsError) {
    return (
      <PageSection>
        <Alert title={t('Error loading virtual machines')} variant="danger">
          {vmsError?.message || t('An unknown error occurred')}
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
    <PageSection>
      <Stack hasGutter>
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
        {config.sections.map(({ Component, id, subHeader, title }) => (
          <Component key={id} {...sectionData} subHeader={subHeader} title={title} />
        ))}
      </Stack>
    </PageSection>
  );
};

export default OverviewTab;
