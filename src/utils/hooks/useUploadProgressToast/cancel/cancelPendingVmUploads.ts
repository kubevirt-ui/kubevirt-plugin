import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';

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
  void useUploadProgressStore.getState().cancelAllPendingUploads();
};
