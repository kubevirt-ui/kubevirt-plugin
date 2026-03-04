import React, { FC, useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Alert, Bullseye, PageSection, Spinner, Stack } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';
import { getVMIFromMapper } from '@virtualmachines/utils/mappers';

import { determineOverviewLevel, getOverviewConfig } from './config';
import { OverviewTabProps } from './types';

const OverviewTab: FC<OverviewTabProps> = ({ cluster, namespace }) => {
  useSignals();
  const { t } = useKubevirtTranslation();

  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();
  const isMultiCluster = useIsAllClustersPage();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

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

  const vmis = useMemo(
    () =>
      (vms || [])
        .map((vm) => getVMIFromMapper(vmiMapper, vm, isACMPage ? hubClusterName : undefined))
        .filter(Boolean),
    [vms, vmiMapper, isACMPage, hubClusterName],
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
      vmis,
      vms: vms || [],
    }),
    [cluster, namespace, vmis, vms],
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

  if (!vmisLoaded || !vmsLoaded) {
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
