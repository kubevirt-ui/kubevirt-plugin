import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { StatusScoreItem } from '../../shared/StatusScoreList/StatusScoreList';

import { getSeverityLabel, SeverityCount, TOP_N } from './clusterMetricConstants';
import {
  buildNestedLabelMap,
  buildSeverityCounts,
  computeDistributionScore,
  getAllKeysFromMaps,
  getLevelDescending,
  getResourcePercentages,
  getStatusDescending,
} from './clusterMetricUtils';
import useResourceUtilizationPolls from './useResourceUtilizationPolls';

type NestedMap = Record<string, Record<string, number>>;

type ClustersLoadBalanceData = {
  items: StatusScoreItem[];
  loaded: boolean;
  severityCounts: SeverityCount[];
};

const computeClusterScores = (
  usedCPUMap: NestedMap,
  totalCPUMap: NestedMap,
  usedMemMap: NestedMap,
  totalMemMap: NestedMap,
  usedStorMap: NestedMap,
  totalStorMap: NestedMap,
): { name: string; score: number }[] => {
  const allClusters = getAllKeysFromMaps(
    usedCPUMap,
    totalCPUMap,
    usedMemMap,
    totalMemMap,
    usedStorMap,
    totalStorMap,
  );

  const scores: { name: string; score: number }[] = [];

  for (const cluster of allClusters) {
    const nodeNames = getAllKeysFromMaps(
      usedCPUMap[cluster] ?? {},
      totalCPUMap[cluster] ?? {},
      usedMemMap[cluster] ?? {},
      totalMemMap[cluster] ?? {},
      usedStorMap[cluster] ?? {},
      totalStorMap[cluster] ?? {},
    );

    const usedMaps = {
      cpu: usedCPUMap[cluster] ?? {},
      memory: usedMemMap[cluster] ?? {},
      storage: usedStorMap[cluster] ?? {},
    };
    const totalNodeMaps = {
      cpu: totalCPUMap[cluster] ?? {},
      memory: totalMemMap[cluster] ?? {},
      storage: totalStorMap[cluster] ?? {},
    };

    const nodeOveralls: number[] = [];
    for (const node of nodeNames) {
      const { overall } = getResourcePercentages(usedMaps, totalNodeMaps, node);
      nodeOveralls.push(overall);
    }

    scores.push({ name: cluster, score: computeDistributionScore(nodeOveralls) });
  }

  return scores.sort((a, b) => b.score - a.score);
};

const useClustersLoadBalanceData = (): ClustersLoadBalanceData => {
  const { t } = useKubevirtTranslation();

  const { loaded, totalCPU, totalMemory, totalStorage, usedCPU, usedMemory, usedStorage } =
    useResourceUtilizationPolls({ allClusters: true, groupBy: 'cluster, node' });

  const { items, severityCounts } = useMemo(() => {
    const usedCPUMap = buildNestedLabelMap(usedCPU?.data?.result ?? [], 'cluster', 'node');
    const totalCPUMap = buildNestedLabelMap(totalCPU?.data?.result ?? [], 'cluster', 'node');
    const usedMemMap = buildNestedLabelMap(usedMemory?.data?.result ?? [], 'cluster', 'node');
    const totalMemMap = buildNestedLabelMap(totalMemory?.data?.result ?? [], 'cluster', 'node');
    const usedStorMap = buildNestedLabelMap(usedStorage?.data?.result ?? [], 'cluster', 'node');
    const totalStorMap = buildNestedLabelMap(totalStorage?.data?.result ?? [], 'cluster', 'node');

    const clusterScores = computeClusterScores(
      usedCPUMap,
      totalCPUMap,
      usedMemMap,
      totalMemMap,
      usedStorMap,
      totalStorMap,
    );

    const computedItems: StatusScoreItem[] = clusterScores.slice(0, TOP_N).map((c) => ({
      name: c.name,
      score: {
        description: getSeverityLabel(getLevelDescending(c.score), t),
        status: getStatusDescending(c.score),
        value: t('Load balance score: {{score}}%', { score: Math.round(c.score) }),
      },
    }));

    const computedSeverity = buildSeverityCounts(
      clusterScores.map((c) => c.score),
      'descending',
    );

    return { items: computedItems, severityCounts: computedSeverity };
  }, [usedCPU, totalCPU, usedMemory, totalMemory, usedStorage, totalStorage, t]);

  return { items, loaded, severityCounts };
};

export default useClustersLoadBalanceData;
