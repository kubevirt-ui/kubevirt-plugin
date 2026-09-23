import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

type UseNodes = () => [nodes: IoK8sApiCoreV1Node[], loaded: boolean, error: Error | null];

// Nodes are cluster-scoped with no per-namespace fallback, and non-admins are frequently
// denied `watch` access -- check first and skip the watch entirely if forbidden.
const useNodes: UseNodes = () => {
  const [canWatchNodes, canWatchNodesLoading] = useAccessReview({
    resource: NodeModel.plural,
    verb: 'watch' as K8sVerb,
  });

  const [nodes, nodesLoaded, nodesError] = useK8sWatchResource<IoK8sApiCoreV1Node[]>(
    canWatchNodes && {
      groupVersionKind: modelToGroupVersionKind(NodeModel),
      isList: true,
    },
  );

  if (canWatchNodesLoading) {
    return [[], false, null];
  }

  if (!canWatchNodes) {
    // Distinct from "successfully loaded, cluster has no Nodes" so consumers can tell them apart.
    return [[], false, new Error('User cannot watch Node resources')];
  }

  return [nodes, nodesLoaded, nodesError];
};

export default useNodes;
