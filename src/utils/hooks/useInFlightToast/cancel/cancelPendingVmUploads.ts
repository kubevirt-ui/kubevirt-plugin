import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { getUploadClusterForVm } from '../keys/uploadKeys';
import { getUploadsActions } from '../shared/selectors/inFlightToastStoreSelectors';

export const cancelPendingVmUploads = (vm?: V1VirtualMachine): Promise<void> => {
  const namespace = getNamespace(vm);
  const name = getName(vm);

  if (!namespace || !name || !vm) {
    return Promise.resolve();
  }

  return getUploadsActions().cancelUploadsForVm(getUploadClusterForVm(vm), namespace, name);
};

export const cancelAllWizardPendingUploads = (uploadKeys: string[] = []): void => {
  getUploadsActions()
    .cancelWizardPendingUploads(uploadKeys)
    .catch(() => {});
};
