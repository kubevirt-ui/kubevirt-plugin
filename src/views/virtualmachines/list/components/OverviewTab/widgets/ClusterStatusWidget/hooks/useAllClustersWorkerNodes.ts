import { useMemo } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { WORKER_NODE_LABEL } from '@kubevirt-utils/resources/node/hooks/useWorkerNodes';
import { getName } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useKubevirtSearchPoll from '@multicluster/hooks/useKubevirtSearchPoll';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const allClustersWorkerNodesWatchOptions = {
  groupVersionKind: modelToGroupVersionKind(NodeModel),
  isList: true,
  namespaced: false,
  selector: {
    matchLabels: { [WORKER_NODE_LABEL]: '' },
  },
};

type UseAllClustersWorkerNodesResult = {
  loaded: boolean;
  nodesCount: number;
  workerNodesByCluster: Map<string, Set<string>>;
};

const useAllClustersWorkerNodes = (): UseAllClustersWorkerNodesResult => {
  const [allClustersNodes, loaded] = useKubevirtSearchPoll<K8sResourceCommon[]>(
    allClustersWorkerNodesWatchOptions,
  );

  const { nodesCount, workerNodesByCluster } = useMemo(() => {
    const nodes = allClustersNodes || [];
    const map = new Map<string, Set<string>>();
    let count = 0;
    for (const node of nodes) {
      const cluster = getCluster(node);
      const name = getName(node);
      if (cluster && name) {
        let workerNodes = map.get(cluster);
        if (!workerNodes) {
          workerNodes = new Set<string>();
          map.set(cluster, workerNodes);
        }
        workerNodes.add(name);
        count++;
      }
    }
    return { nodesCount: count, workerNodesByCluster: map };
  }, [allClustersNodes]);

  return { loaded, nodesCount, workerNodesByCluster };
};

export default useAllClustersWorkerNodes;
