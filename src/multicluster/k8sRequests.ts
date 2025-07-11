import {
  k8sCreate,
  k8sDelete,
  k8sGet,
  k8sPatch,
  k8sUpdate,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  fleetK8sCreate,
  fleetK8sDelete,
  fleetK8sGet,
  fleetK8sPatch,
  fleetK8sUpdate,
  getFleetK8sAPIPath,
  OptionsCreate,
  OptionsDelete,
  OptionsGet,
  OptionsPatch,
  OptionsUpdate,
} from '@stolostron/multicluster-sdk';

import { BASE_K8S_API_PATH } from './constants';

export const getKubevirtBaseAPIPath = async (cluster?: string) => {
  if (!cluster) return BASE_K8S_API_PATH;

  return await getFleetK8sAPIPath(cluster);
};

export const kubevirtK8sPatch = <R extends K8sResourceCommon>(
  options: OptionsPatch<R>,
): Promise<R> => {
  if (options?.cluster) {
    return fleetK8sPatch(options);
  }

  return k8sPatch(options);
};

export const kubevirtK8sUpdate = <R extends K8sResourceCommon>(
  options: OptionsUpdate<R>,
): Promise<R> => {
  if (options?.cluster || options?.data?.cluster) {
    return fleetK8sUpdate(options);
  }

  return k8sUpdate(options);
};

export const kubevirtK8sGet = <R extends K8sResourceCommon>(options: OptionsGet): Promise<R> => {
  if (options?.cluster) {
    return fleetK8sGet(options);
  }

  return k8sGet(options);
};

export const kubevirtK8sDelete = <R extends K8sResourceCommon>(
  options: OptionsDelete<R>,
): Promise<R> => {
  if (options?.cluster || options?.resource?.cluster) {
    return fleetK8sDelete(options);
  }

  return k8sDelete(options);
};

export const kubevirtK8sCreate = <R extends K8sResourceCommon>(
  options: OptionsCreate<R>,
): Promise<R> => {
  if (options?.cluster || options?.data?.cluster) {
    return fleetK8sCreate(options);
  }

  return k8sCreate(options);
};
