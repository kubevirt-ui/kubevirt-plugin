import { cancelAllWizardPendingUploads } from '@kubevirt-utils/hooks/useUploadProgressToast';
import { setCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';

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

  it('cancels pending wizard uploads', () => {
    clearVMPendingUploadsAndSignal();

    expect(cancelAllWizardPendingUploads).toHaveBeenCalledTimes(1);
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith();
  });
});
