import { useMemo } from 'react';

import {
  DeschedulerStatus,
  useDeschedulerInstalled,
} from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { DistributionBucket } from '../../shared/DistributionBarChart/DistributionBarChart';
import { StatusScoreItem } from '../../shared/StatusScoreList/StatusScoreList';

import {
  buildLabelMap,
  computeDistributionScore,
  getAllKeysFromMaps,
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
  deschedulerStatus: DeschedulerStatus;
  distributionScore: number;
  items: StatusScoreItem[];
  loaded: boolean;
};

export const useNodeLoadDistributionData = (): NodeLoadDistributionData => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const { status: deschedulerStatus } = useDeschedulerInstalled(cluster);

  const { loaded, totalCPU, totalMemory, totalStorage, usedCPU, usedMemory, usedStorage } =
    useResourceUtilizationPolls({ cluster, groupBy: 'node' });

  const resourceLabels: ResourceLabels = useMemo(
    () => ({ cpu: t('CPU'), memory: t('Memory'), storage: t('Storage') }),
    [t],
  );

  const bucketLabels: [string, string, string, string] = useMemo(
    () => [t('0-25%'), t('25-50%'), t('50-75%'), t('75-100%')],
    [t],
  );

  const { buckets, distributionScore, items } = useMemo(() => {
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

    const allNodes = getAllKeysFromMaps(
      usedMaps.cpu,
      totalMaps.cpu,
      usedMaps.memory,
      totalMaps.memory,
      usedMaps.storage,
      totalMaps.storage,
    );

    const nodes: NodeUtilization[] = [];
    for (const name of allNodes) {
      const { cpu, memory, overall, storage } = getResourcePercentages(usedMaps, totalMaps, name);
      nodes.push({ cpu, memory, name, overall, storage });
    }

    return {
      buckets: computeBuckets(nodes, bucketLabels),
      distributionScore: computeDistributionScore(nodes.map((n) => n.overall)),
      items: buildTopNodeItems(nodes, resourceLabels),
    };
  }, [
    usedCPU,
    totalCPU,
    usedMemory,
    totalMemory,
    usedStorage,
    totalStorage,
    resourceLabels,
    bucketLabels,
  ]);

  return { buckets, deschedulerStatus, distributionScore, items, loaded };
};
