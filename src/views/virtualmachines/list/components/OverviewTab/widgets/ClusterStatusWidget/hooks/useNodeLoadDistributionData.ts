import { useMemo } from 'react';

import { DeschedulerStatus } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useDeschedulerStatus } from '@kubevirt-utils/hooks/useDeschedulerStatus/useDeschedulerStatus';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useWorkerNodes from '@kubevirt-utils/resources/node/hooks/useWorkerNodes';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { DistributionBucket } from '../../shared/DistributionBarChart/DistributionBarChart';
import { StatusScoreItem } from '../../shared/StatusScoreList/StatusScoreList';

import {
  buildLabelMap,
  computeDistributionScore,
  getResourcePercentages,
} from './clusterMetricUtils';
import {
  buildTopNodeItems,
  computeBuckets,
  NodeUtilization,
  ResourceLabels,
} from './nodeLoadDistributionUtils';
import useResourceUtilizationPolls from './useResourceUtilizationPolls';

type NodeLoadDistributionData = {
  buckets: DistributionBucket[];
  deschedulerLoaded: boolean;
  deschedulerStatus: DeschedulerStatus;
  distributionScore: number;
  items: StatusScoreItem[];
  loaded: boolean;
  totalNodeCount: number;
};

export const useNodeLoadDistributionData = (clusterOverride?: string): NodeLoadDistributionData => {
  const { t } = useKubevirtTranslation();
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;
  const { loaded: deschedulerLoaded, status: deschedulerStatus } = useDeschedulerStatus(cluster);
  const [workerNodes, workerNodesLoaded] = useWorkerNodes(cluster);

  const {
    loaded: metricsLoaded,
    totalCPU,
    totalMemory,
    totalStorage,
    usedCPU,
    usedMemory,
    usedStorage,
  } = useResourceUtilizationPolls({ cluster, groupBy: 'node' });

  const workerNodeNames = useMemo(
    () => new Set((workerNodes ?? []).map((n) => n.metadata?.name).filter(Boolean)),
    [workerNodes],
  );

  const resourceLabels: ResourceLabels = useMemo(
    () => ({ cpu: t('CPU'), memory: t('Memory'), storage: t('Storage') }),
    [t],
  );

  const bucketLabels: [string, string, string, string] = useMemo(
    () => [t('0-25%'), t('25-50%'), t('50-75%'), t('75-100%')],
    [t],
  );

  const { buckets, distributionScore, items, totalNodeCount } = useMemo(() => {
    const usedMaps = {
      cpu: buildLabelMap(usedCPU?.data?.result ?? []),
      memory: buildLabelMap(usedMemory?.data?.result ?? []),
      storage: buildLabelMap(usedStorage?.data?.result ?? []),
    };
    const totalMaps = {
      cpu: buildLabelMap(totalCPU?.data?.result ?? []),
      memory: buildLabelMap(totalMemory?.data?.result ?? []),
      storage: buildLabelMap(totalStorage?.data?.result ?? []),
    };

    const nodes: NodeUtilization[] = [];
    for (const name of workerNodeNames) {
      const { cpu, memory, overall, storage } = getResourcePercentages(usedMaps, totalMaps, name);
      nodes.push({ cpu, memory, name, overall, storage });
    }

    return {
      buckets: computeBuckets(nodes, bucketLabels),
      distributionScore: computeDistributionScore(nodes.map((n) => n.overall)),
      items: buildTopNodeItems(nodes, resourceLabels),
      totalNodeCount: nodes.length,
    };
  }, [
    usedCPU,
    totalCPU,
    usedMemory,
    totalMemory,
    usedStorage,
    totalStorage,
    workerNodeNames,
    resourceLabels,
    bucketLabels,
  ]);

  return {
    buckets,
    deschedulerLoaded,
    deschedulerStatus,
    distributionScore,
    items,
    loaded: metricsLoaded && workerNodesLoaded,
    totalNodeCount,
  };
};
