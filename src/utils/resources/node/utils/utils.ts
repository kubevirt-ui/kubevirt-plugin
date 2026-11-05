import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getNodeConditions } from '@kubevirt-utils/resources/node/utils/selectors';

import { NodeStatus } from './types';

export const isNodeReady = (node: IoK8sApiCoreV1Node): boolean => {
  return (
    getNodeConditions(node)?.some?.(
      ({ status, type }) => type === NodeStatus.READY && status === 'True',
    ) ?? false
  );
};

export const nodeStatus = (node: IoK8sApiCoreV1Node): string =>
  isNodeReady(node) ? 'Ready' : 'Not Ready';

export const isNodeSchedulable = (node: IoK8sApiCoreV1Node): boolean => {
  return !node?.spec?.unschedulable;
};

/**
 * Returns true when the node's labels satisfy every entry of the given
 * nodeSelector (matchLabels semantics). An empty/undefined selector matches
 * any node. Note: this only covers `spec.nodeSelector`; it does not evaluate
 * `spec.affinity` node affinity rules.
 * @param {IoK8sApiCoreV1Node} node the node to test
 * @param {Record<string, string>} [nodeSelector] the required node selector
 * @returns {boolean} whether the node satisfies the selector
 */
export const nodeMatchesNodeSelector = (
  node: IoK8sApiCoreV1Node,
  nodeSelector?: Record<string, string>,
): boolean => {
  const labels = node?.metadata?.labels ?? {};
  return Object.entries(nodeSelector ?? {}).every(([key, value]) => labels[key] === value);
};
