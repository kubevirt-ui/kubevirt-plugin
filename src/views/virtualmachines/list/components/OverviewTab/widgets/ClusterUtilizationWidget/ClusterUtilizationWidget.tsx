import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import UtilizationBar from '../shared/UtilizationBar';

import './ClusterUtilizationWidget.scss';

type ClusterUtilizationWidgetProps = {
  cpuLoad?: number;
  isLoading?: boolean;
  memoryLoad?: number;
  storageLoad?: number;
};

const ClusterUtilizationWidget: FC<ClusterUtilizationWidgetProps> = ({
  cpuLoad = 0,
  isLoading,
  memoryLoad = 0,
  storageLoad = 0,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Card className="cluster-utilization-widget" data-test="cluster-utilization-widget" isCompact>
      <CardHeader>
        <CardTitle>{t('Cluster utilization')}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="cluster-utilization-widget__subtitle">
          {t('Cluster averages')}{' '}
          <span className="cluster-utilization-widget__subtitle-detail">
            ({t('Across all nodes')})
          </span>
        </div>
        <div className="cluster-utilization-widget__charts">
          <UtilizationBar isLoading={isLoading} percentage={cpuLoad} title={t('CPU load')} />
          <UtilizationBar isLoading={isLoading} percentage={memoryLoad} title={t('Memory load')} />
          <UtilizationBar
            isLoading={isLoading}
            percentage={storageLoad}
            title={t('Storage load')}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default ClusterUtilizationWidget;
