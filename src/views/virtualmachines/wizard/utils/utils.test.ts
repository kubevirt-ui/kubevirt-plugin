import { cancelAllWizardPendingUploads } from '@kubevirt-utils/hooks/useUploadProgressToast';
import { setCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import {
  addWizardBootableVolumeUploadKey,
  clearWizardBootableVolumeUploadKeys,
  getWizardBootableVolumeUploadKeys,
} from '@kubevirt-utils/signals/wizardBootableVolumeKeysSignal';

import { clearVMPendingUploadsAndSignal } from './utils';

jest.mock('@kubevirt-utils/hooks/useUploadProgressToast', () => ({
  cancelAllWizardPendingUploads: jest.fn(),
}));

jest.mock('@kubevirt-utils/signals/customizeWizardVMSignal', () => ({
  setCustomizeWizardVMSignal: jest.fn(),
}));

describe('clearVMPendingUploadsAndSignal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearWizardBootableVolumeUploadKeys();
  });

  it('cancels wizard pending uploads before clearing the signal', () => {
    const callOrder: string[] = [];
    (cancelAllWizardPendingUploads as jest.Mock).mockImplementation(() =>
      callOrder.push('cancelUploads'),
    );
    (setCustomizeWizardVMSignal as jest.Mock).mockImplementation(() => callOrder.push('setSignal'));

    clearVMPendingUploadsAndSignal();

    expect(callOrder).toEqual(['cancelUploads', 'setSignal']);
  });

  it('clears the signal with null', () => {
    clearVMPendingUploadsAndSignal();

    expect(setCustomizeWizardVMSignal).toHaveBeenCalledWith(null);
  });

  it('cancels uploads for the explicit form draft and clears tracked boot uploads', () => {
    const vm = { metadata: { name: 'draft', namespace: 'test' }, spec: { template: {} } };
    addWizardBootableVolumeUploadKey('boot-upload');
    clearVMPendingUploadsAndSignal(vm);

    expect(cancelAllWizardPendingUploads).toHaveBeenCalledTimes(1);
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith(vm, ['boot-upload']);
    expect(getWizardBootableVolumeUploadKeys()).toEqual([]);
  });
});
