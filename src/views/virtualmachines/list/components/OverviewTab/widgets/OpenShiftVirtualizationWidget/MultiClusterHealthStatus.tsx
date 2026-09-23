import type { FC, ReactNode } from 'react';

import {
  getClusterMetricsNotAvailableLabel,
  getClusterMetricsUnavailableMessage,
} from '@kubevirt-utils/errors/clusterMetricsAccess';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
  healthForbidden?: boolean;
  isLoading: boolean;
};

const MultiClusterHealthStatus: FC<MultiClusterHealthStatusProps> = ({
  criticalClusters,
  criticalCount,
  degradedClusters,
  degradedCount,
  healthForbidden,
  isLoading,
}) => {
  const { t } = useKubevirtTranslation();
  const permissionMessage = healthForbidden ? getClusterMetricsUnavailableMessage(t) : undefined;
  const notAvailableLabel = healthForbidden ? getClusterMetricsNotAvailableLabel(t) : undefined;

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
      {items.map(({ clusters, count, icon, label }) => {
        if (healthForbidden) {
          return (
            <StatusCountItem
              key={label}
              label={label}
              span={6}
              statusMessage={notAvailableLabel}
              tooltip={permissionMessage}
            />
          );
        }

        return (
          <StatusCountItem
            count={count}
            icon={icon}
            isLoading={isLoading}
            key={label}
            label={label}
            span={6}
            tooltip={!isEmpty(clusters) ? <ClusterNameTooltip clusters={clusters} /> : undefined}
          />
        );
      })}
    </>
  );
};

export default MultiClusterHealthStatus;
