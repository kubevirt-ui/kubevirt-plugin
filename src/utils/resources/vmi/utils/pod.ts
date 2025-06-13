import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

/**
 * Get if the pod is in a ready status
 * @date 4/10/2022 - 8:13:37 AM
 *
 * @param {*} pod - The pod to check
 * @returns {boolean}
 */
export const isPodReady = (pod): boolean =>
  pod?.status?.phase === 'Running' && pod?.status?.containerStatuses?.every((s) => s?.ready);

/**
 * Get the vmi pod
 * @date 4/10/2022 - 8:13:37 AM
 *
 * @param {V1VirtualMachineInstance} vmi - The vmi to check
 * @param {IoK8sApiCoreV1Pod[]} pods - The pods to check
 * @returns {*}
 */
export const getVMIPod = (vmi: V1VirtualMachineInstance, pods: IoK8sApiCoreV1Pod[]) => {
  if (!pods || !vmi) {
    return null;
  }

  const vmUID = vmi?.metadata?.uid;
  const prefixedPods = pods.filter((pod) => {
    const podOwnerReferences = pod?.metadata?.ownerReferences;
    return (
      pod?.metadata?.namespace === vmi?.metadata?.namespace &&
      podOwnerReferences &&
      podOwnerReferences?.some((podOwnerReference) => podOwnerReference?.uid === vmUID)
    );
  });

  // Return the newest, most ready Pod created
  return prefixedPods
    .sort((a: IoK8sApiCoreV1Pod, b: IoK8sApiCoreV1Pod) =>
      a.metadata.creationTimestamp > b.metadata.creationTimestamp ? -1 : 1,
    )
    .sort((a: IoK8sApiCoreV1Pod) => (isPodReady(a) ? -1 : 1))[0];
};
