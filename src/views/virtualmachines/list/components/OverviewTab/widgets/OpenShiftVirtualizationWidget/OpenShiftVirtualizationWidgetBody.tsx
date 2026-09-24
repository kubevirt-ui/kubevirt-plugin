import type { FC, ReactNode } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import {
  getClusterMetricsNotAvailableLabel,
  getClusterMetricsUnavailableMessage,
  isForbiddenError,
} from '@kubevirt-utils/errors/clusterMetricsAccess';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import { Bullseye, Grid } from '@patternfly/react-core';

import StatusCountItem from '../shared/StatusCountItem';
import MultiClusterHealthStatus from './MultiClusterHealthStatus';

type OpenShiftVirtualizationWidgetBodyProps = {
  alertsError?: unknown;
  criticalClusters?: string[];
  criticalCount?: number;
  csvError: unknown;
  degradedClusters?: string[];
  degradedCount?: number;
  healthError: unknown;
  healthForbidden?: boolean;
  isAllClustersPage?: boolean;
  isLoading: boolean;
  metricsUnavailable?: boolean;
  numberOfAlerts: number;
  statusIcon: ReactNode;
  statusMessage: string;
};

const OpenShiftVirtualizationWidgetBody: FC<OpenShiftVirtualizationWidgetBodyProps> = ({
  alertsError,
  criticalClusters,
  criticalCount,
  csvError,
  degradedClusters,
  degradedCount,
  healthError,
  healthForbidden: healthForbiddenProp,
  isAllClustersPage,
  isLoading,
  metricsUnavailable,
  numberOfAlerts,
  statusIcon,
  statusMessage,
}) => {
  const { t } = useKubevirtTranslation();
  const healthForbidden = healthForbiddenProp ?? isForbiddenError(healthError);
  const alertsForbidden = isForbiddenError(alertsError);
  const permissionMessage = getClusterMetricsUnavailableMessage(t);
  const notAvailableLabel = getClusterMetricsNotAvailableLabel(t);

  if (csvError) {
    return <ErrorAlert error={csvError} />;
  }

  if (metricsUnavailable) {
    return (
      <Bullseye>
        <MutedTextSpan text={getNoDataAvailableMessage(t)} />
      </Bullseye>
    );
  }

  if (healthError && !healthForbidden) {
    return <ErrorAlert error={healthError} />;
  }

  return (
    <Grid className="openshift-virtualization-widget__body-grid" hasGutter>
      {isAllClustersPage && (
        <MultiClusterHealthStatus
          criticalClusters={criticalClusters ?? []}
          criticalCount={criticalCount ?? 0}
          degradedClusters={degradedClusters ?? []}
          degradedCount={degradedCount ?? 0}
          healthForbidden={healthForbidden}
          isLoading={isLoading}
        />
      )}
      {!isAllClustersPage && (
        <>
          <StatusCountItem
            icon={healthForbidden ? undefined : statusIcon}
            isLoading={isLoading && !healthForbidden}
            label={t('Status')}
            span={6}
            statusMessage={healthForbidden ? notAvailableLabel : statusMessage}
            tooltip={healthForbidden ? permissionMessage : undefined}
          />
          <StatusCountItem
            count={alertsForbidden ? undefined : numberOfAlerts}
            isLoading={isLoading && !alertsForbidden}
            label={t('Alerts')}
            span={6}
            statusMessage={alertsForbidden ? notAvailableLabel : undefined}
            tooltip={alertsForbidden ? permissionMessage : undefined}
          />
        </>
      )}
    </Grid>
  );
};

export default OpenShiftVirtualizationWidgetBody;
