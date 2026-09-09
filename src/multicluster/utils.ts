import { type K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

/**
 * useFleetK8sWatchResource does not inject apiVersion/kind into list items
 * (unlike fleetK8sList which does). This normalizes fleet data so that
 * getGroupVersionKindForResource and kind-based type guards work correctly.
 */
export const enrichFleetData = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  data: T,
  gvk: K8sGroupVersionKind,
): T => {
  if (!data || !gvk?.kind || !gvk?.version) return data;

  const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;

  const enrichResource = <R extends K8sResourceCommon>(resource: R): R =>
    resource.apiVersion && resource.kind
      ? resource
      : ({ apiVersion, kind: gvk.kind, ...resource } as R);

  if (Array.isArray(data)) {
    return data.map((item) => enrichResource(item)) as T;
  }

  return enrichResource(data as K8sResourceCommon & T) as T;
};
