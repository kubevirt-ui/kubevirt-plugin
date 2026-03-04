import React, { FC } from 'react';

import { ClusterChartSeries } from '../../hooks/useTopClustersChartData';

import './ClusterLegend.scss';

type ClusterLegendProps = {
  clusters: ClusterChartSeries[];
};

const ClusterLegend: FC<ClusterLegendProps> = ({ clusters }) => {
  if (!clusters || clusters.length === 0) return null;

  return (
    <div className="cluster-legend">
      {clusters.map(({ clusterName, color }) => (
        <div className="cluster-legend__item" key={clusterName}>
          <span className="cluster-legend__swatch" style={{ backgroundColor: color }} />
          <span className="cluster-legend__label">{clusterName}</span>
        </div>
      ))}
    </div>
  );
};

export default ClusterLegend;
