import React, { FC, useMemo } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import useInfrastructureAlerts from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HealthState } from '@openshift-console/dynamic-plugin-sdk';
import { healthStateMapping } from '@overview/OverviewTab/status-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Grid, Skeleton } from '@patternfly/react-core';

import StatusCountItem from '../shared/StatusCountItem';

import { getUpdateAvailableActions } from './getUpdateAvailableActions';
import MultiClusterHealthStatus from './MultiClusterHealthStatus';
import { useCNVHealth } from './useCNVHealth';
import { useCNVUpdate } from './useCNVUpdate';
import { getHealthStateToMessage, NBSP } from './utils';

import './OpenShiftVirtualizationWidget.scss';

type OpenShiftVirtualizationWidgetProps = {
  cluster?: string;
  isAllClustersPage?: boolean;
};

const OpenShiftVirtualizationWidget: FC<OpenShiftVirtualizationWidgetProps> = ({
  cluster,
  isAllClustersPage,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    installedCSV,
    loaded: csvLoaded,
    loadErrors: csvError,
  } = useKubevirtClusterServiceVersion(cluster);
  const { loaded: alertsLoaded, numberOfAlerts } = useInfrastructureAlerts();
  const {
    criticalClusters,
    criticalCount,
    degradedClusters,
    degradedCount,
    error: healthError,
    healthState,
    loaded: healthLoaded,
  } = useCNVHealth(cluster, isAllClustersPage);
  const { isSpokeCluster, operatorLink, operatorLinkExternal, updateAvailable } = useCNVUpdate(
    cluster,
    isAllClustersPage,
  );

  const version = installedCSV?.spec?.version;
  const statusIcon = healthStateMapping[healthState]?.icon;
  const healthMessages = getHealthStateToMessage(t);
  const statusMessage = healthMessages[healthState] || healthMessages[HealthState.NOT_AVAILABLE];

  const isLoading = isAllClustersPage
    ? !healthLoaded
    : !csvLoaded || !alertsLoaded || !healthLoaded;

  const subtitleContent = useMemo(() => {
    if (isAllClustersPage) {
      return NBSP;
    }
    if (isLoading) {
      return <Skeleton width="50%" />;
    }
    return t('Installed version {{version}}', { version: version || t('Unknown') });
  }, [isAllClustersPage, isLoading, version, t]);

  return (
    <Card
      className="openshift-virtualization-widget"
      data-test="openshift-virtualization-widget"
      isCompact
    >
      <CardHeader
        actions={getUpdateAvailableActions({
          isSpokeCluster,
          operatorLink,
          operatorLinkExternal,
          updateAvailable,
        })}
      >
        <CardTitle>{t('OpenShift Virtualization')}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="openshift-virtualization-widget__subtitle">{subtitleContent}</div>
        {(healthError || csvError) && <ErrorAlert error={healthError || csvError} />}
        {!healthError && !csvError && (
          <Grid className="openshift-virtualization-widget__body-grid" hasGutter>
            {isAllClustersPage && (
              <MultiClusterHealthStatus
                criticalClusters={criticalClusters}
                criticalCount={criticalCount}
                degradedClusters={degradedClusters}
                degradedCount={degradedCount}
                isLoading={isLoading}
              />
            )}
            {!isAllClustersPage && (
              <>
                <StatusCountItem
                  icon={statusIcon}
                  isLoading={isLoading}
                  label={t('Status')}
                  span={6}
                  statusMessage={statusMessage}
                />
                <StatusCountItem
                  count={numberOfAlerts}
                  isLoading={isLoading}
                  label={t('Alerts')}
                  span={6}
                />
              </>
            )}
          </Grid>
        )}
      </CardBody>
    </Card>
  );
};

export default OpenShiftVirtualizationWidget;
