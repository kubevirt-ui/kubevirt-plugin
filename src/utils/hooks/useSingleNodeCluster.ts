import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

type UseSingleNodeCluster = () => [isSingleNodeCluster: boolean, loaded: boolean];

const useSingleNodeCluster: UseSingleNodeCluster = () => {
  const [canAccessInfra] = useAccessReview({
    group: NodeModel.apiGroup,
    resource: NodeModel.plural,
    verb: 'list' as K8sVerb,
  });

  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const isSingleNodeCluster = nodes?.length === 1;

  return canAccessInfra ? [isSingleNodeCluster, nodesLoaded] : [undefined, true];
};

export default useSingleNodeCluster;
