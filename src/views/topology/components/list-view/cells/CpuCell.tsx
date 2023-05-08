import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatCores } from '@console/internal/components/hooks';
import { DataListCell } from '@patternfly/react-core';
import { Node } from '@patternfly/react-topology';

import { getTopologyResourceObject } from '../../../utils/topology-utils';
import { useMetricStats } from '../../../utils/useMetricStats';

import MetricsTooltip from './MetricsTooltip';

import './MetricsCell.scss';

type CpuCellComponentProps = {
  cpuByPod: any;
  totalCores: number;
};

const CpuCellComponent: React.FC<CpuCellComponentProps> = React.memo(({ cpuByPod, totalCores }) => {
  const { t } = useTranslation();
  return (
    <div className="odc-topology-list-view__metrics-cell__detail--cpu">
      <MetricsTooltip metricLabel={t('kubevirt-plugin~CPU')} byPod={cpuByPod}>
        <span>
          <span className="odc-topology-list-view__metrics-cell__metric-value">
            {formatCores(totalCores)}
          </span>
          &nbsp;
          <span className="odc-topology-list-view__metrics-cell__metric-unit">cores</span>
        </span>
      </MetricsTooltip>
    </div>
  );
});

type CpuCellProps = {
  item: Node;
};

const CpuCell: React.FC<CpuCellProps> = ({ item }) => {
  const resource = getTopologyResourceObject(item.getData());
  const memoryStats = useMetricStats(resource);

  return (
    <DataListCell id={`${item.getId()}_metrics`}>
      {!memoryStats || !memoryStats.totalBytes || !memoryStats.totalCores ? null : (
        <CpuCellComponent cpuByPod={memoryStats.cpuByPod} totalCores={memoryStats.totalCores} />
      )}
    </DataListCell>
  );
};

export { CpuCell, CpuCellComponent };
