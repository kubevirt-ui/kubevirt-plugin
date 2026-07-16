import { K8sGroupVersionKind, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const enrichResource = (
  resource: K8sResourceCommon,
  apiVersion: string,
  kind: string,
): K8sResourceCommon =>
  resource.apiVersion && resource.kind ? resource : { apiVersion, kind, ...resource };

const getApiVersion = (groupVersionKind: K8sGroupVersionKind) =>
  groupVersionKind.group
    ? `${groupVersionKind.group}/${groupVersionKind.version}`
    : groupVersionKind.version;

/**
 * useFleetK8sWatchResource does not inject apiVersion/kind into list items
 * (unlike fleetK8sList which does). This normalizes fleet data so that
 * getGroupVersionKindForResource and kind-based type guards work correctly.
 */
export const enrichFleetData = <T>(data: T, groupVersionKind: K8sGroupVersionKind): T => {
  if (!data || !groupVersionKind?.kind || !groupVersionKind?.version) return data;

  const apiVersion = getApiVersion(groupVersionKind);

  if (Array.isArray(data)) {
    return data.map((item: K8sResourceCommon) =>
      enrichResource(item, apiVersion, groupVersionKind.kind),
    ) as T;
  }

  return enrichResource(data, apiVersion, groupVersionKind.kind) as T;
};
