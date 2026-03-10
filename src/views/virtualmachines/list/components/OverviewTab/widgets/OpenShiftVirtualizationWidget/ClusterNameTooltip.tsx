import React, { FC } from 'react';

type ClusterNameTooltipProps = {
  clusters: string[];
};

const ClusterNameTooltip: FC<ClusterNameTooltipProps> = ({ clusters }) =>
  clusters.length > 0 ? (
    <div>
      {clusters.map((name) => (
        <div key={name}>{name}</div>
      ))}
    </div>
  ) : null;

export default ClusterNameTooltip;
