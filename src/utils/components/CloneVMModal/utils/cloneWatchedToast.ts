import { type TFunction } from 'i18next';

import { modelToGroupVersionKind, VirtualMachineCloneModel } from '@kubevirt-utils/models';
import { type WatchedToastData } from '@kubevirt-utils/signals/toastRequestResultSignal';
import { getErrorMessage } from '@kubevirt-utils/utils/errorUtils';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

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
}: GetToastWatchResourceDataParams): Omit<WatchedToastData, 'id'> => ({
  toastOptions: {
    content: t(
      'Clone completed. The cloned virtual machine may take some time to appear in the list.',
    ),
    title,
  },
  watchDataResource: getWatchResourceCloneData(metadataName, namespace, cluster),
});

export const getFailedCloneToastOptions = (
  t: TFunction,
  title: string,
  watchedToastData: Omit<WatchedToastData, 'id'>,
  error: unknown,
): Partial<WatchedToastData> => ({
  toastOptions: {
    ...(watchedToastData.toastOptions ?? {}),
    content: t(getErrorMessage(error)),
    title,
  },
});
