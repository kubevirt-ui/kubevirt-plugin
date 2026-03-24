import { useMemo } from 'react';

import { StatusScoreItem } from '../../shared/StatusScoreList/StatusScoreList';

import { SeverityCount, TOP_N } from './clusterMetricConstants';
import {
  buildLabelMap,
  buildSeverityCounts,
  formatPercent,
  getAllKeysFromMaps,
  getResourcePercentages,
  getStatusAscending,
} from './clusterMetricUtils';
import useResourceUtilizationPolls from './useResourceUtilizationPolls';

type ClustersUtilizationData = {
  items: StatusScoreItem[];
  loaded: boolean;
  severityCounts: SeverityCount[];
  totalCount: number;
};

const useClustersUtilizationData = (): ClustersUtilizationData => {
  const { loaded, totalCPU, totalMemory, totalStorage, usedCPU, usedMemory, usedStorage } =
    useResourceUtilizationPolls({ allClusters: true, groupBy: 'cluster' });

  const { items, severityCounts, totalCount } = useMemo(() => {
    const usedMaps = {
      cpu: buildLabelMap(usedCPU?.data?.result ?? [], 'cluster'),
      memory: buildLabelMap(usedMemory?.data?.result ?? [], 'cluster'),
      storage: buildLabelMap(usedStorage?.data?.result ?? [], 'cluster'),
    };
    const totalMaps = {
      cpu: buildLabelMap(totalCPU?.data?.result ?? [], 'cluster'),
      memory: buildLabelMap(totalMemory?.data?.result ?? [], 'cluster'),
      storage: buildLabelMap(totalStorage?.data?.result ?? [], 'cluster'),
    };

    const allClusters = getAllKeysFromMaps(
      usedMaps.cpu,
      totalMaps.cpu,
      usedMaps.memory,
      totalMaps.memory,
      usedMaps.storage,
      totalMaps.storage,
    );

    const clusterUtils: { name: string; overall: number }[] = [];
    for (const name of allClusters) {
      const { overall } = getResourcePercentages(usedMaps, totalMaps, name);
      clusterUtils.push({ name, overall });
    }

    clusterUtils.sort((a, b) => b.overall - a.overall);

    const computedItems: StatusScoreItem[] = clusterUtils.slice(0, TOP_N).map((c) => ({
      name: c.name,
      score: {
        status: getStatusAscending(c.overall),
        value: formatPercent(c.overall),
      },
    }));

    const computedSeverity = buildSeverityCounts(
      clusterUtils.map((c) => c.overall),
      'ascending',
    );

    return {
      items: computedItems,
      severityCounts: computedSeverity,
      totalCount: clusterUtils.length,
    };
  }, [usedCPU, totalCPU, usedMemory, totalMemory, usedStorage, totalStorage]);

  return { items, loaded, severityCounts, totalCount };
};

export default useClustersUtilizationData;
