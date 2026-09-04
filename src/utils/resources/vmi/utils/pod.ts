import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Get if the pod is in a ready status
 * @date 4/10/2022 - 8:13:37 AM
 *
 * @param {*} pod - The pod to check
 * @returns {boolean}
 */
export const isPodReady = (pod): boolean =>
  pod?.status?.phase === 'Running' &&
  pod?.status?.containerStatuses?.every((containerStatus) => containerStatus?.ready);

/**
 * Get the vmi pod
 * @date 4/10/2022 - 8:13:37 AM
 *
 * @param {V1VirtualMachineInstance} vmi - The vmi to check
 * @param {K8sResourceCommon[]} pods - The pods to check
 * @returns {*}
 */
export const getVMIPod = (
  vmi: null | undefined | V1VirtualMachineInstance,
  pods: IoK8sApiCoreV1Pod[],
): IoK8sApiCoreV1Pod | null | undefined => {
  if (!pods || !vmi) {
    return null;
  }

  const vmUID = vmi?.metadata?.uid;
  const prefixedPods = pods.filter((pod) => {
    const podOwnerReferences = pod?.metadata?.ownerReferences;
    return (
      pod?.metadata?.namespace === vmi?.metadata?.namespace &&
      podOwnerReferences?.some((podOwnerReference) => podOwnerReference?.uid === vmUID)
    );
  });

  // Return the newest, most ready Pod created
  const sortedByTime = prefixedPods.toSorted((a: K8sResourceCommon, b: K8sResourceCommon) =>
    a.metadata.creationTimestamp > b.metadata.creationTimestamp ? -1 : 1,
  );
  return sortedByTime.toSorted((a: K8sResourceCommon) => (isPodReady(a) ? -1 : 1))[0];
};
