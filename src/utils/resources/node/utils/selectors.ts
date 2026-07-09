import { IoK8sApiCoreV1NodeCondition } from '@forklift-ui/types';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';

/**
 * A selector for the Node's conditions
 * @param {IoK8sApiCoreV1Node} node
 * @returns {IoK8sApiCoreV1NodeCondition[]} the Node's conditions
 */
export const getNodeConditions = (node: IoK8sApiCoreV1Node): IoK8sApiCoreV1NodeCondition[] =>
  node?.status?.conditions;

/**
 * Returns the default architecture used as a fallback when no architecture
 * can be determined from the VM spec or node info.
 * Mirrors KubeVirt's own server-side default (runtime.GOARCH of virt-controller
 * on standard amd64 control planes).
 * @returns {ARCHITECTURES} the default architecture
 */
export const getDefaultArchitecture = (): ARCHITECTURES => ARCHITECTURES.AMD64;

/**
 * Returns the architecture reported by the node via status.nodeInfo.architecture,
 * falling back to getDefaultArchitecture() if not available.
 * @param {IoK8sApiCoreV1Node} node
 * @returns {string} the node's architecture
 */
export const getNodeArchitecture = (node: IoK8sApiCoreV1Node): string =>
  node?.status?.nodeInfo?.architecture || getDefaultArchitecture();
