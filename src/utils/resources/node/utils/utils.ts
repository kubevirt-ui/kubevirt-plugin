import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { getNodeConditions } from '@kubevirt-utils/resources/node/utils/selectors';

import { NodeStatus } from './types';

export const isNodeReady = (node: IoK8sApiCoreV1Node): boolean => {
  return (
    getNodeConditions(node)?.some?.(
      ({ status, type }) => type === NodeStatus.READY && status === 'True',
    ) ?? false
  );
};

export const nodeStatus = (node: IoK8sApiCoreV1Node) => (isNodeReady(node) ? 'Ready' : 'Not Ready');
