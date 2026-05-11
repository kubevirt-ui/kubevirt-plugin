import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

/**
 * useFleetK8sWatchResource does not inject apiVersion/kind into list items
 * (unlike fleetK8sList which does). This normalizes fleet data so that
 * getGroupVersionKindForResource and kind-based type guards work correctly.
 */
export const enrichFleetData = <T>(data: T, gvk: K8sGroupVersionKind): T => {
  if (!data || !gvk?.kind || !gvk?.version) return data;

  const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;

  const enrichResource = (resource: K8sResourceCommon) =>
    resource.apiVersion && resource.kind ? resource : { apiVersion, kind: gvk.kind, ...resource };

  if (Array.isArray(data)) {
    return data.map((item: K8sResourceCommon) => enrichResource(item)) as T;
  }

  return enrichResource(data) as T;
};
