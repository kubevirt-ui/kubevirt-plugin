import { type K8sResourceCommon, type OwnerReference } from '@openshift-console/dynamic-plugin-sdk';

export const buildOwnerReference = (
  owner: K8sResourceCommon,
  opts: { blockOwnerDeletion?: boolean; controller?: boolean } = { blockOwnerDeletion: true },
): OwnerReference => ({
  apiVersion: owner?.apiVersion,
  blockOwnerDeletion: opts?.blockOwnerDeletion,
  controller: opts?.controller,
  kind: owner?.kind,
  name: owner?.metadata?.name,
  uid: owner?.metadata?.uid,
});

export const compareOwnerReferences = (obj: OwnerReference, otherObj: OwnerReference): boolean => {
  if (obj === otherObj) {
    return true;
  }
  if (!obj || !otherObj) {
    return false;
  }

  return (
    obj?.uid === otherObj?.uid ||
    obj?.name === otherObj?.name ||
    obj?.apiVersion === otherObj?.apiVersion ||
    obj?.kind === otherObj?.kind
  );
};
