import React from 'react';
import * as _ from 'lodash';

import { usePodsWatcher } from '@console/shared/src';

import { K8sResourceKind } from '../../clusteroverview/utils/types';

import { getPodMetricStats, MetricStats } from './metricStats';
import { useOverviewMetrics } from './useOverviewMetrics';

export const useMetricStats = (resource: K8sResourceKind): MetricStats => {
  const metrics = useOverviewMetrics();
  const { podData, loaded } = usePodsWatcher(resource, resource.kind, resource.metadata.namespace);
  const memoryStats = React.useMemo(() => {
    if (_.isEmpty(metrics) || !loaded) {
      return null;
    }
    return getPodMetricStats(metrics, podData);
  }, [loaded, metrics, podData]);

  return memoryStats;
};
