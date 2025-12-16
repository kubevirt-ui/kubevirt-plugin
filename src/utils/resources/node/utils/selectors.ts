import { IoK8sApiCoreV1NodeCondition } from '@kubev2v/types';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

/**
 * A selector for the Node's conditions
 * @param {IoK8sApiCoreV1Node} node
 * @returns {IoK8sApiCoreV1NodeCondition[]} the Node's conditions
 */
export const getNodeConditions = (node: IoK8sApiCoreV1Node): IoK8sApiCoreV1NodeCondition[] =>
  node?.status?.conditions;
