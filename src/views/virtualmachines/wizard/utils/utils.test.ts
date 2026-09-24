import { cancelAllWizardPendingUploads } from '@kubevirt-utils/hooks/useUploadProgressToast';
import {
  addWizardBootableVolumeUploadKey,
  clearWizardBootableVolumeUploadKeys,
  getWizardBootableVolumeUploadKeys,
} from '@kubevirt-utils/signals/wizardBootableVolumeKeysSignal';

import { clearVMPendingUploads } from './utils';

jest.mock('@kubevirt-utils/hooks/useUploadProgressToast', () => ({
  cancelAllWizardPendingUploads: jest.fn(),
}));

describe('clearVMPendingUploads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearWizardBootableVolumeUploadKeys();
  });

  it('cancels uploads for the explicit form draft and clears tracked boot uploads', () => {
    const vm = { metadata: { name: 'draft', namespace: 'test' }, spec: { template: {} } };
    addWizardBootableVolumeUploadKey('boot-upload');
    clearVMPendingUploads(vm);

    expect(cancelAllWizardPendingUploads).toHaveBeenCalledTimes(1);
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith(vm, ['boot-upload']);
    expect(getWizardBootableVolumeUploadKeys()).toEqual([]);
  });
});
