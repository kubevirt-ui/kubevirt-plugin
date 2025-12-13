import React, { FC, useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useClusterObservabilityDisabled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterObservabilityDisabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { ERROR, OTHER } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import {
  getOtherStatuses,
  getVMStatuses,
} from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Divider, Grid } from '@patternfly/react-core';

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

  // Get enabled clusters to filter VM status queries when fetching for all clusters
  const {
    enabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
  } = useClusterObservabilityDisabled();

  const [vms, loaded, error] = useK8sWatchData<V1VirtualMachine[]>(
    useMemo(
      () => ({
        cluster,
        groupVersionKind: VirtualMachineModelGroupVersionKind,
        isList: true,
        namespace: namespace,
        namespaced: Boolean(namespace),
      }),
      [cluster, namespace],
    ),
    useMemo(() => {
      if (cluster === ALL_CLUSTERS_KEY && observabilityLoaded) {
        // Pass empty array to explicitly signal "query no clusters" when none are enabled
        // This prevents falling back to querying all clusters
        return { selectedClusters: enabledClusters };
      }
      return undefined;
    }, [cluster, enabledClusters, observabilityLoaded]),
  );

  const { otherStatuses, otherStatusesCount, primaryStatuses } = getVMStatuses(vms || []);

  const displayError = observabilityError || error;

  return (
    <Card className="vm-statuses-card" data-test-id="vm-statuses-card">
      <CardHeader className="vm-statuses-card__header">
        <CardTitle>{t('VirtualMachine statuses')}</CardTitle>
      </CardHeader>
      {!loaded ? (
        <CardBody>
          {displayError ? <ErrorAlert error={displayError} /> : <LoadingEmptyState />}
        </CardBody>
      ) : (
        <>
          <div className="vm-statuses-card__body">
            <Grid hasGutter>
              <VMStatusItem
                count={primaryStatuses.Error}
                namespace={activeNamespace}
                statusArray={[ERROR]}
                statusLabel={ERROR}
              />
              <VMStatusItem
                count={primaryStatuses.Running}
                namespace={activeNamespace}
                statusArray={[VM_STATUS.Running]}
                statusLabel={VM_STATUS.Running}
              />
              <VMStatusItem
                count={primaryStatuses.Stopped}
                namespace={activeNamespace}
                statusArray={[VM_STATUS.Stopped]}
                statusLabel={VM_STATUS.Stopped}
              />
              <VMStatusItem
                count={otherStatusesCount}
                namespace={activeNamespace}
                statusArray={OTHER_STATUSES}
                statusLabel={t(OTHER)}
              />
            </Grid>
          </div>
          <Divider />
          <VMAdditionalStatuses
            activeNamespace={activeNamespace}
            otherStatuses={otherStatuses}
            otherStatusesCount={otherStatusesCount}
          />
        </>
      )}
    </Card>
  );
};

export default VMStatusesCard;
