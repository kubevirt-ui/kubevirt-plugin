import React, { FC, useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { Alert, Bullseye, PageSection, Spinner, Stack } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { determineOverviewLevel, getOverviewConfig } from './config';
import { OverviewTabProps } from './types';

const OverviewTab: FC<OverviewTabProps> = ({ cluster, namespace }) => {
  useSignals();
  const { t } = useKubevirtTranslation();

  const isMultiCluster = useIsAllClustersPage();

  const [vms, vmsLoaded, vmsError] = useKubevirtWatchResource<V1VirtualMachine[]>(
    {
      cluster,
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      limit: OBJECTS_FETCHING_LIMIT,
      namespace,
      namespaced: !!namespace,
    },
    undefined,
  );

  const overviewLevel = useMemo(
    () => determineOverviewLevel(namespace, isMultiCluster),
    [namespace, isMultiCluster],
  );

  const config = useMemo(() => getOverviewConfig(overviewLevel, t), [overviewLevel, t]);

  const sectionData = useMemo(
    () => ({
      cluster,
      namespace,
      vms: vms || [],
    }),
    [cluster, namespace, vms],
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

  return (
    <PageSection>
      <Stack hasGutter>
        {config.sections.map(({ Component, id, subHeader, title }) => (
          <Component key={id} {...sectionData} subHeader={subHeader} title={title} />
        ))}
      </Stack>
    </PageSection>
  );
};

export default OverviewTab;
