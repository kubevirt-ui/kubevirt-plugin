import { type TFunction } from 'i18next';

import {
  type WatchedResourceData,
  type WatchedResourceToast,
} from '@kubevirt-utils/hooks/useUploadProgressToast/watchedResources/types/types';
import { modelToGroupVersionKind, VirtualMachineCloneModel } from '@kubevirt-utils/models';
import { getErrorMessage } from '@kubevirt-utils/utils/errorUtils';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

import { CLONE_COMPLETED_CONTENT } from './constants';

export const getWatchResourceCloneData = (
  name: string,
  namespace: string,
  cluster: string | undefined,
): FleetWatchK8sResource | undefined => {
  if (!name || !namespace) {
    return;
  }

  return {
    cluster,
    groupVersionKind: modelToGroupVersionKind(VirtualMachineCloneModel),
    name,
    namespace,
  };
};

type GetToastWatchResourceDataParams = {
  cluster?: string;
  metadataName: string;
  namespace: string;
  t: TFunction;
  title: string;
};

export const getToastWatchResourceData = ({
  cluster,
  metadataName,
  namespace,
  t,
  title,
}: GetToastWatchResourceDataParams): WatchedResourceData => ({
  toastOptions: {
    content: t(CLONE_COMPLETED_CONTENT),
    title,
  },
  watchDataResource: getWatchResourceCloneData(metadataName, namespace, cluster),
});

export const getFailedCloneToastOptions = (
  t: TFunction,
  title: string,
  watchedToastData: WatchedResourceData,
  error: unknown,
): Partial<WatchedResourceToast> => ({
  toastOptions: {
    ...(watchedToastData.toastOptions ?? {}),
    content: t(getErrorMessage(error)),
    title,
  },
});
