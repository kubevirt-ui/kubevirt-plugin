import {
  DataSourceModel,
  DataVolumeModel,
  modelToGroupVersionKind,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { isK8sNotFoundError } from '@kubevirt-utils/resources/errorStatusChecks';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import type { UploadLinkedResource } from '../types';
import { useUploadProgressStore } from '../uploadProgressStore';

import {
  notifyBootableVolumeDeleted,
  notifyDataVolumeDeleted,
} from '../cancel/notifyDeletedUploadResources';
import { isSameGroupVersionKind } from '../completion/uploadLinkedResource';

export const isUploadLinkedResourceGone = (
  resource: K8sResourceCommon | undefined,
  loaded: boolean,
  error: unknown,
  wasObservedAlive = false,
): boolean => {
  if (!loaded) {
    return false;
  }

  if (resource?.metadata?.deletionTimestamp) {
    return true;
  }

  return wasObservedAlive && isK8sNotFoundError(error);
};

export const notifyDeletedUploadLinkedResource = (resource: UploadLinkedResource): void => {
  const { cluster, groupVersionKind, name, namespace } = resource;

  if (isSameGroupVersionKind(groupVersionKind, modelToGroupVersionKind(VirtualMachineModel))) {
    if (namespace && name) {
      useUploadProgressStore.getState().stripVmStorageLinksForVm(cluster ?? '', namespace, name);
    }
    return;
  }

  if (isSameGroupVersionKind(groupVersionKind, modelToGroupVersionKind(DataVolumeModel))) {
    notifyDataVolumeDeleted(name, namespace, cluster);
    return;
  }

  if (isSameGroupVersionKind(groupVersionKind, modelToGroupVersionKind(DataSourceModel))) {
    notifyBootableVolumeDeleted(name, namespace, cluster);
  }
};
