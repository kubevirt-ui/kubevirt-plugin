import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { useInFlightToastStore } from '../inFlightToastStore';

import { getUploadClusterForVm } from '../keys/uploadKeys';

export const cancelPendingVmUploads = (vm?: V1VirtualMachine): Promise<void> => {
  const namespace = getNamespace(vm);
  const name = getName(vm);

  if (!namespace || !name || !vm) {
    return Promise.resolve();
  }

  return useInFlightToastStore
    .getState()
    .uploads.actions?.cancelUploadsForVm(getUploadClusterForVm(vm), namespace, name);
};

export const cancelAllWizardPendingUploads = (uploadKeys: string[] = []): void => {
  useInFlightToastStore
    .getState()
    .uploads.actions?.cancelWizardPendingUploads(uploadKeys)
    .catch(() => {});
};
