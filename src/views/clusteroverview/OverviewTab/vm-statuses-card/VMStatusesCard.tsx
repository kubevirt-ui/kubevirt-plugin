import React, { FC, useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useClusterObservabilityDisabled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterObservabilityDisabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { ERROR, OTHER } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import {
  getOtherStatuses,
  getVMStatuses,
} from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Divider, Grid } from '@patternfly/react-core';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

import VMAdditionalStatuses from './VMAdditionalStatuses';
import VMStatusItem from './VMStatusItem';

import './VMStatusesCard.scss';

const VMStatusesCard: FC = () => {
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();
  const namespace = useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? undefined : activeNamespace),
    [activeNamespace],
  );

  const { t } = useKubevirtTranslation();
  const OTHER_STATUSES = getOtherStatuses();

  const {
    enabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
  } = useClusterObservabilityDisabled(true);

  const normalizedCluster = cluster === ALL_CLUSTERS_KEY ? undefined : cluster;

  const searchQueries = useMemo<AdvancedSearchFilter | undefined>(() => {
    if (cluster === ALL_CLUSTERS_KEY && observabilityLoaded) {
      return [{ property: 'cluster', values: enabledClusters }];
    }
    return undefined;
  }, [cluster, enabledClusters, observabilityLoaded]);

  const [vms, loaded, error] = useKubevirtWatchResource<V1VirtualMachine[]>(
    useMemo(
      () => ({
        cluster: normalizedCluster,
        groupVersionKind: VirtualMachineModelGroupVersionKind,
        isList: true,
        namespace: namespace,
        namespaced: Boolean(namespace),
      }),
      [normalizedCluster, namespace],
    ),
    undefined,
    searchQueries,
  );

  const { otherStatuses, otherStatusesCount, primaryStatuses } = getVMStatuses(vms || []);

  const displayError = observabilityError || error;

  return (
    <Card className="vm-statuses-card" data-test-id="vm-statuses-card">
      <CardHeader className="vm-statuses-card__header">
        <CardTitle>{t('VirtualMachine statuses')}</CardTitle>
      </CardHeader>
      {displayError && (
        <CardBody>
          <ErrorAlert error={displayError} />
        </CardBody>
      )}
      {!loaded && !displayError && (
        <CardBody>
          <LoadingEmptyState />
        </CardBody>
      )}
      {loaded && (
        <>
          <div className="vm-statuses-card__body">
            <Grid hasGutter>
              <VMStatusItem
                count={primaryStatuses.Error}
                enabledClusters={enabledClusters}
                namespace={activeNamespace}
                statusArray={[ERROR]}
                statusLabel={ERROR}
              />
              <VMStatusItem
                count={primaryStatuses.Running}
                enabledClusters={enabledClusters}
                namespace={activeNamespace}
                statusArray={[VM_STATUS.Running]}
                statusLabel={VM_STATUS.Running}
              />
              <VMStatusItem
                count={primaryStatuses.Stopped}
                enabledClusters={enabledClusters}
                namespace={activeNamespace}
                statusArray={[VM_STATUS.Stopped]}
                statusLabel={VM_STATUS.Stopped}
              />
              <VMStatusItem
                count={otherStatusesCount}
                enabledClusters={enabledClusters}
                namespace={activeNamespace}
                statusArray={OTHER_STATUSES}
                statusLabel={t(OTHER)}
              />
            </Grid>
          </div>
          <Divider />
          <VMAdditionalStatuses
            activeNamespace={activeNamespace}
            enabledClusters={enabledClusters}
            otherStatuses={otherStatuses}
            otherStatusesCount={otherStatusesCount}
          />
        </>
      )}
    </Card>
  );
};

export default VMStatusesCard;
