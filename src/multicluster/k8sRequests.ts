import {
  k8sCreate,
  k8sDelete,
  k8sGet,
  k8sListItems,
  k8sPatch,
  k8sUpdate,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Fleet,
  fleetK8sCreate,
  FleetK8sCreateUpdateOptions,
  fleetK8sDelete,
  FleetK8sDeleteOptions,
  fleetK8sGet,
  FleetK8sGetOptions,
  fleetK8sListItems,
  FleetK8sListOptions,
  fleetK8sPatch,
  FleetK8sPatchOptions,
  fleetK8sUpdate,
  getFleetK8sAPIPath,
} from '@stolostron/multicluster-sdk';

import { BASE_K8S_API_PATH } from './constants';

export const getKubevirtBaseAPIPath = async (cluster?: string) => {
  if (!cluster) return BASE_K8S_API_PATH;

  return await getFleetK8sAPIPath(cluster);
};

export const kubevirtK8sPatch = async <R extends K8sResourceCommon>(
  options: FleetK8sPatchOptions<R>,
): Promise<R> => {
  if (options?.cluster || options?.resource?.cluster) {
    const object = await fleetK8sPatch<R>(options);

    if (object) object.cluster = options?.cluster || options?.resource?.cluster;
    return object;
  }

  return k8sPatch(options);
};

export const kubevirtK8sUpdate = async <R extends K8sResourceCommon>(
  options: FleetK8sCreateUpdateOptions<R>,
): Promise<R> => {
  if (options?.cluster || options?.data?.cluster) {
    const object = await fleetK8sUpdate<R>(options);

    if (object) object.cluster = options?.cluster || options?.data?.cluster;
    return object;
  }

  return k8sUpdate(options);
};

export const kubevirtK8sGet = async <R extends K8sResourceCommon>(
  options: FleetK8sGetOptions,
): Promise<R> => {
  if (options?.cluster) {
    const object = await fleetK8sGet<R>(options);

    if (object) {
      object.cluster = options?.cluster;
    }
    return object;
  }

  return k8sGet(options) as Promise<R>;
};

export const kubevirtK8sDelete = async <R extends K8sResourceCommon>(
  options: FleetK8sDeleteOptions<R>,
): Promise<R> => {
  if (options?.cluster || options?.resource?.cluster) {
    const object = await fleetK8sDelete<R>(options);

    if (object) object.cluster = options?.cluster || options?.resource?.cluster;
    return object;
  }

  return k8sDelete(options);
};

export const kubevirtK8sCreate = async <R extends K8sResourceCommon>(
  options: FleetK8sCreateUpdateOptions<R>,
): Promise<R> => {
  if (options?.cluster || options?.data?.cluster) {
    const object = await fleetK8sCreate<R>(options);

    if (object) object.cluster = options?.cluster || options?.data?.cluster;
    return object;
  }

  return k8sCreate(options);
};

export const kubevirtK8sListItems = async <R extends K8sResourceCommon>(
  options: Fleet<FleetK8sListOptions>,
): Promise<R[]> => {
  if (options?.cluster) {
    const object = await fleetK8sListItems<R>(options);

    return object;
  }

  return k8sListItems<R>(options);
};
