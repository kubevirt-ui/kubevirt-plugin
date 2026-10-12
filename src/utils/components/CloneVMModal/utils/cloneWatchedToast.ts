import { type TFunction } from 'i18next';

import { type V1beta1VirtualMachineClone } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, VirtualMachineCloneModel } from '@kubevirt-utils/models';
import { type WatchedToastData } from '@kubevirt-utils/signals/toastRequestResultSignal';
import { getErrorMessage } from '@kubevirt-utils/utils/errorUtils';

export const getWatchResourceCloneData = (
  name: string,
  namespace: string,
  cluster: string | undefined,
): V1beta1VirtualMachineClone | undefined => {
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

type GetToastWatchResourceDataProps = {
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
}: GetToastWatchResourceDataProps): Omit<WatchedToastData, 'id'> => ({
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
