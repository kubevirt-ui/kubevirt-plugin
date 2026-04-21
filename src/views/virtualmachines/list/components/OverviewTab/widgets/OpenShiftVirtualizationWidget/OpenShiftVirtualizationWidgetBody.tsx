import React, { FC, ReactNode } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import { Bullseye, Grid } from '@patternfly/react-core';

import StatusCountItem from '../shared/StatusCountItem';

import MultiClusterHealthStatus from './MultiClusterHealthStatus';

type OpenShiftVirtualizationWidgetBodyProps = {
  criticalClusters?: string[];
  criticalCount?: number;
  csvError: unknown;
  degradedClusters?: string[];
  degradedCount?: number;
  healthError: unknown;
  isAllClustersPage?: boolean;
  isLoading: boolean;
  metricsUnavailable?: boolean;
  numberOfAlerts: number;
  statusIcon: ReactNode;
  statusMessage: string;
};

const OpenShiftVirtualizationWidgetBody: FC<OpenShiftVirtualizationWidgetBodyProps> = ({
  criticalClusters,
  criticalCount,
  csvError,
  degradedClusters,
  degradedCount,
  healthError,
  isAllClustersPage,
  isLoading,
  metricsUnavailable,
  numberOfAlerts,
  statusIcon,
  statusMessage,
}) => {
  const { t } = useKubevirtTranslation();

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

  if (healthError) {
    return <ErrorAlert error={healthError} />;
  }

  return (
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
  );
};

export default OpenShiftVirtualizationWidgetBody;
