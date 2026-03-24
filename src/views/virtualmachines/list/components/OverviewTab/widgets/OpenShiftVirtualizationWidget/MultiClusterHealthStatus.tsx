import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

import StatusCountItem from '../shared/StatusCountItem';

import ClusterNameTooltip from './ClusterNameTooltip';

type MultiClusterHealthStatusProps = {
  criticalClusters: string[];
  criticalCount: number;
  degradedClusters: string[];
  degradedCount: number;
  isLoading: boolean;
};

const MultiClusterHealthStatus: FC<MultiClusterHealthStatusProps> = ({
  criticalClusters,
  criticalCount,
  degradedClusters,
  degradedCount,
  isLoading,
}) => {
  const { t } = useKubevirtTranslation();

  const items: {
    clusters: string[];
    count: number;
    icon: ReactNode;
    label: string;
  }[] = [
    {
      clusters: criticalClusters,
      count: criticalCount,
      icon: <RedExclamationCircleIcon />,
      label: t('Clusters critical'),
    },
    {
      clusters: degradedClusters,
      count: degradedCount,
      icon: <YellowExclamationTriangleIcon />,
      label: t('Clusters degraded'),
    },
  ];

  return (
    <>
      {items.map(({ clusters, count, icon, label }) => (
        <StatusCountItem
          count={count}
          icon={icon}
          isLoading={isLoading}
          key={label}
          label={label}
          span={6}
          tooltip={clusters.length > 0 ? <ClusterNameTooltip clusters={clusters} /> : null}
        />
      ))}
    </>
  );
};

export default MultiClusterHealthStatus;
