import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Get if the pod is in a ready status
 * @date 4/10/2022 - 8:13:37 AM
 *
 * @param {*} pod
 * @returns {boolean}
 */
export const isPodReady = (pod): boolean =>
  pod?.status?.phase === 'Running' && pod?.status?.containerStatuses?.every((s) => s?.ready);

/**
 * Get the vmi pod
 * @date 4/10/2022 - 8:13:37 AM
 *
 * @param {V1VirtualMachineInstance} vmi
 * @param {K8sResourceCommon[]} pods
 * @returns {*}
 */
export const getVMIPod = (vmi: V1VirtualMachineInstance, pods: K8sResourceCommon[]) => {
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
    .sort((a: K8sResourceCommon, b: K8sResourceCommon) =>
      a.metadata.creationTimestamp > b.metadata.creationTimestamp ? -1 : 1,
    )
    .sort((a: K8sResourceCommon) => (isPodReady(a) ? -1 : 1))[0];
};
