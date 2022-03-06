import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const isPodReady = (pod): boolean =>
  pod?.status?.phase === 'Running' && pod?.status?.containerStatuses?.every((s) => s?.ready);

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
