import React, { FC } from 'react';

import useIsACMPage from '@multicluster/useIsACMPage';
import { StackItem } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import MCONotInstalledAlert from './MCONotInstalledAlert';
import NoVMsAlert from './NoVMsAlert';
import ObservabilityDisabledAlert from './ObservabilityDisabledAlert';
import { getIsSpokeCluster, getShowMCOWarning, getShowObservabilityWarning } from './utils';

import './OverviewAlerts.scss';

type OverviewAlertsProps = {
  cluster?: string;
  disabledClusters: string[];
  hasNoVMs: boolean;
  isAllClustersPage: boolean;
  mcoInstalled: boolean;
  namespace?: string;
  observabilityError: unknown;
  observabilityLoaded: boolean;
};

const OverviewAlerts: FC<OverviewAlertsProps> = ({
  cluster,
  disabledClusters,
  hasNoVMs,
  isAllClustersPage,
  mcoInstalled,
  namespace,
  observabilityError,
  observabilityLoaded,
}) => {
  const isACMPage = useIsACMPage();
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();

  const isSpokeCluster = getIsSpokeCluster({
    cluster,
    hubClusterName,
    isACMPage,
    isAllClustersPage,
    loaded: hubClusterLoaded,
  });

  const alertClusters = isSpokeCluster ? [cluster] : disabledClusters;

  const showMCOWarning = getShowMCOWarning({
    isACMPage,
    isAllClustersPage,
    isSpokeCluster,
    mcoInstalled,
    observabilityLoaded,
  });

  const showObservabilityWarning = getShowObservabilityWarning({
    cluster,
    disabledClusters,
    isACMPage,
    isAllClustersPage,
    isSpokeCluster,
    mcoInstalled,
    observabilityError,
    observabilityLoaded,
  });

  if (!hasNoVMs && !showObservabilityWarning && !showMCOWarning) {
    return null;
  }

  return (
    <>
      {showMCOWarning && (
        <StackItem className="overview-alerts__item">
          <MCONotInstalledAlert />
        </StackItem>
      )}
      {!showMCOWarning && showObservabilityWarning && (
        <StackItem className="overview-alerts__item">
          <ObservabilityDisabledAlert disabledClusters={alertClusters} />
        </StackItem>
      )}
      {hasNoVMs && (
        <StackItem className="overview-alerts__item">
          <NoVMsAlert namespace={namespace} />
        </StackItem>
      )}
    </>
  );
};

export default OverviewAlerts;
