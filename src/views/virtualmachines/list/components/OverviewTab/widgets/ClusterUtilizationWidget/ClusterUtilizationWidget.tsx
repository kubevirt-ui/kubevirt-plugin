import React, { FCC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import { Bullseye, Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import UtilizationBar from '../shared/UtilizationBar';

import './ClusterUtilizationWidget.scss';

type ClusterUtilizationWidgetProps = {
  cpuLoad?: number;
  isLoading?: boolean;
  memoryLoad?: number;
  metricsUnavailable?: boolean;
  storageLoad?: number;
};

const ClusterUtilizationWidget: FCC<ClusterUtilizationWidgetProps> = ({
  cpuLoad = 0,
  isLoading,
  memoryLoad = 0,
  metricsUnavailable,
  storageLoad = 0,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Card className="cluster-utilization-widget" data-test="cluster-utilization-widget" isCompact>
      <CardHeader>
        <CardTitle>{t('Cluster utilization')}</CardTitle>
      </CardHeader>
      <CardBody>
        {metricsUnavailable ? (
          <Bullseye>
            <MutedTextSpan text={getNoDataAvailableMessage(t)} />
          </Bullseye>
        ) : (
          <>
            <div className="cluster-utilization-widget__subtitle">
              {t('Cluster averages')}{' '}
              <span className="cluster-utilization-widget__subtitle-detail">
                ({t('Across all nodes')})
              </span>
            </div>
            <div className="cluster-utilization-widget__charts">
              <UtilizationBar isLoading={isLoading} percentage={cpuLoad} title={t('CPU load')} />
              <UtilizationBar
                isLoading={isLoading}
                percentage={memoryLoad}
                title={t('Memory load')}
              />
              <UtilizationBar
                isLoading={isLoading}
                percentage={storageLoad}
                title={t('Storage load')}
              />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default ClusterUtilizationWidget;
