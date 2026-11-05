import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getUploadLinkedResource } from '@kubevirt-utils/hooks/useInFlightToast/completion/uploadLinkedResource';
import { type WatchedResourceEntry } from '@kubevirt-utils/hooks/useInFlightToast/features/watchedResources/types/types';
import { type UploadSuccessLink } from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';
import { modelToGroupVersionKind, VirtualMachineCloneModel } from '@kubevirt-utils/models';
import { getVMURL } from '@multicluster/urls';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

import { CLONE_COMPLETED_CONTENT, CLONE_IN_PROGRESS_CONTENT, TOAST_TIMEOUT_MS } from './constants';

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

export const getCloneVmSuccessLinks = (
  t: TFunction,
  cluster: string | undefined,
  namespace: string,
  vmName: string,
): UploadSuccessLink[] => [
  {
    label: t('View {{name}}', { name: vmName }),
    resource: getUploadLinkedResource(VirtualMachineModel, vmName, namespace, cluster),
    url: getVMURL(cluster ?? '', namespace, vmName),
  },
];

type GetToastWatchResourceDataParams = {
  cluster?: string;
  metadataName: string;
  namespace: string;
  t: TFunction;
  targetVmName: string;
  title: string;
};

export const getToastWatchResourceData = ({
  cluster,
  metadataName,
  namespace,
  t,
  targetVmName,
  title,
}: GetToastWatchResourceDataParams): WatchedResourceEntry => ({
  toastOptions: {
    content: t(CLONE_IN_PROGRESS_CONTENT),
    showInitialToast: true,
    successLinks: getCloneVmSuccessLinks(t, cluster, namespace, targetVmName),
    successTitle: t(CLONE_COMPLETED_CONTENT),
    timeout: TOAST_TIMEOUT_MS,
    title,
  },
  watchDataResource: getWatchResourceCloneData(metadataName, namespace, cluster),
});

export const getFailedCloneToastOptions = (error: unknown): { error: unknown } => ({
  error,
});
