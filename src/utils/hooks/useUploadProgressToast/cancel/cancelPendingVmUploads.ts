import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  customizeWizardVMSignal,
  getCustomizeWizardVM,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import {
  getWizardBootableVolumeUploadKeys,
  clearWizardBootableVolumeUploadKeys,
} from '@kubevirt-utils/signals/wizardBootableVolumeKeysSignal';

import { getUploadClusterForVm } from '../keys/uploadKeys';
import { useUploadProgressStore } from '../uploadProgressStore';

export const cancelPendingVmUploads = (vm?: V1VirtualMachine): Promise<void> => {
  const target = vm ?? customizeWizardVMSignal.value;
  const namespace = getNamespace(target);
  const name = getName(target);

  if (!namespace || !name || !target) {
    return Promise.resolve();
  }

  return useUploadProgressStore
    .getState()
    .cancelUploadsForVm(getUploadClusterForVm(target), namespace, name);
};

export const cancelAllWizardPendingUploads = (): void => {
  const wizardVm = getCustomizeWizardVM();
  const wizardBootableVolumeKeys = getWizardBootableVolumeUploadKeys();

  clearWizardBootableVolumeUploadKeys();

  useUploadProgressStore
    .getState()
    .cancelWizardPendingUploads(wizardVm ?? undefined, wizardBootableVolumeKeys)
    .catch(() => {});
};
