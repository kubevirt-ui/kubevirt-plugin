import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type K8sModel,
  type K8sResourceCommon,
  type K8sResourceKind,
} from '@openshift-console/dynamic-plugin-sdk';

export const getOwnedResources = <T extends K8sResourceKind>(
  obj: K8sResourceKind,
  resources: T[],
): T[] => {
  const uid = obj?.metadata?.uid;
  if (!uid) {
    return [];
  }
  return resources?.filter(({ metadata: { ownerReferences } }) => {
    return ownerReferences?.some((ownerRef) => ownerRef?.controller && ownerRef.uid);
  });
};

export const getOwnerNameByKind = (obj: K8sResourceCommon, kind: K8sModel): string => {
  return obj?.metadata?.ownerReferences?.find(
    (ref) =>
      ref.kind === kind.kind &&
      ((!kind.apiGroup && ref.apiVersion === 'v1') ||
        ref.apiVersion?.startsWith(`${kind.apiGroup}/`)),
  )?.name;
};

export const getPodsForResource = (
  resource: K8sResourceKind,
  resources: { pods?: { data?: K8sResourceKind[] } },
): IoK8sApiCoreV1Pod[] => {
  const { pods } = resources;
  return getOwnedResources(resource, pods?.data ?? []) as IoK8sApiCoreV1Pod[];
};
