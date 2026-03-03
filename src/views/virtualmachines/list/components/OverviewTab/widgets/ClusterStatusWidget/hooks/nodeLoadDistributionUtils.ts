import { DistributionBucket } from '../../shared/DistributionBarChart/DistributionBarChart';
import { ExtraScoreItem, StatusScoreItem } from '../../shared/StatusScoreList/StatusScoreList';

import { THRESHOLD_MEDIUM, TOP_N } from './clusterMetricConstants';
import { formatPercent, getStatusAscending } from './clusterMetricUtils';

export type NodeUtilization = {
  cpu: number;
  memory: number;
  name: string;
  overall: number;
  storage: number;
};

export type ResourceLabels = { cpu: string; memory: string; storage: string };

const BUCKET_COLORS = [
  'var(--pf-t--chart--theme--colorscales--green--colorscale--100)',
  'var(--pf-t--chart--theme--colorscales--blue--colorscale--200)',
  'var(--pf-t--chart--theme--colorscales--orange--colorscale--100)',
  'var(--pf-t--chart--theme--colorscales--red--colorscale--100)',
] as const;

export const computeBuckets = (
  nodes: NodeUtilization[],
  bucketLabels: [string, string, string, string],
): DistributionBucket[] => {
  const bucketCounts = [0, 0, 0, 0];
  for (const node of nodes) {
    const idx = Number.isFinite(node.overall)
      ? Math.max(0, Math.min(Math.floor(node.overall / 25), 3))
      : 0;
    bucketCounts[idx]++;
  }
  return bucketCounts.map((count, i) => ({
    color: BUCKET_COLORS[i],
    label: bucketLabels[i],
    value: count,
  }));
};

export const buildTopNodeItems = (
  nodes: NodeUtilization[],
  resourceLabels: ResourceLabels,
): StatusScoreItem[] =>
  [...nodes]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, TOP_N)
    .map((node) => {
      const resources = [
        { label: resourceLabels.cpu, pct: node.cpu },
        { label: resourceLabels.memory, pct: node.memory },
        { label: resourceLabels.storage, pct: node.storage },
      ].sort((a, b) => b.pct - a.pct);

      const hottest = resources[0];
      const extras: ExtraScoreItem[] = resources
        .slice(1)
        .filter((r) => r.pct >= THRESHOLD_MEDIUM)
        .map((r) => ({ name: r.label, value: formatPercent(r.pct) }));

      const item: StatusScoreItem = {
        name: node.name,
        score: {
          status: getStatusAscending(node.overall),
          value: formatPercent(node.overall),
        },
        tags: [hottest.label],
      };

      if (extras.length > 0) {
        item.extraCount = extras.length;
        item.extraItems = extras;
      }

      return item;
    });
