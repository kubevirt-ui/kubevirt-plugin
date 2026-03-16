import { useMemo } from 'react';

import {
  DESCHEDULER_ENABLED,
  DESCHEDULER_NOT_ENABLED,
  DESCHEDULER_NOT_INSTALLED,
  DESCHEDULER_UNKNOWN,
} from '@kubevirt-utils/hooks/constants';
import { DeschedulerStatus } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubeDescheduler from '@kubevirt-utils/resources/descheduler/hooks/useKubeDescheduler';
import useWorkerNodes from '@kubevirt-utils/resources/node/hooks/useWorkerNodes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { DESCHEDULER_OPERATOR_NAME } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';

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
};

const installStateToDeschedulerStatus = (
  installState: InstallState,
  hasDeschedulerCR: boolean,
): DeschedulerStatus => {
  if (installState === InstallState.INSTALLED) {
    return hasDeschedulerCR ? DESCHEDULER_ENABLED : DESCHEDULER_NOT_ENABLED;
  }
  if (installState === InstallState.NOT_INSTALLED) return DESCHEDULER_NOT_INSTALLED;
  return DESCHEDULER_UNKNOWN;
};

export const useNodeLoadDistributionData = (): NodeLoadDistributionData => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const [workerNodes, workerNodesLoaded] = useWorkerNodes(cluster);
  const { descheduler: deschedulerCR, deschedulerLoaded: deschedulerCRLoaded } =
    useKubeDescheduler(cluster);

  const deschedulerInstallState = operatorDetailsMap?.[DESCHEDULER_OPERATOR_NAME]?.installState;
  const deschedulerLoaded = (operatorResourcesLoaded && deschedulerCRLoaded) ?? false;
  const deschedulerStatus =
    deschedulerLoaded && deschedulerInstallState !== undefined
      ? installStateToDeschedulerStatus(deschedulerInstallState, !isEmpty(deschedulerCR))
      : DESCHEDULER_UNKNOWN;

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

    const nodes: NodeUtilization[] = [];
    for (const name of workerNodeNames) {
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
  };
};
