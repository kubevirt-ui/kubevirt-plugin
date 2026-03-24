import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

export const WORKER_NODE_LABEL = 'node-role.kubernetes.io/worker';

type UseWorkerNodes = (cluster?: string) => WatchK8sResult<IoK8sApiCoreV1Node[]>;

const useWorkerNodes: UseWorkerNodes = (cluster) =>
  useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
    selector: {
      matchLabels: { [WORKER_NODE_LABEL]: '' },
    },
  });

export default useWorkerNodes;
