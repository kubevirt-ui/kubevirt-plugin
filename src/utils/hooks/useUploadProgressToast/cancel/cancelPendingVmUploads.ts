import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { useUploadProgressStore } from '../uploadProgressStore';

import { getUploadClusterForVm } from '../keys/uploadKeys';

export const cancelPendingVmUploads = (vm?: V1VirtualMachine): Promise<void> => {
  const namespace = getNamespace(vm);
  const name = getName(vm);

  if (!namespace || !name || !vm) {
    return Promise.resolve();
  }

  return useUploadProgressStore
    .getState()
    .cancelUploadsForVm(getUploadClusterForVm(vm), namespace, name);
};

export const cancelAllWizardPendingUploads = (
  wizardVm?: null | V1VirtualMachine,
  wizardBootableVolumeKeys: string[] = [],
): void => {
  useUploadProgressStore
    .getState()
    .cancelWizardPendingUploads(wizardVm ?? undefined, wizardBootableVolumeKeys)
    .catch(() => {});
};
