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

  it('nulls the wizard VM signal before cancelling pending uploads', () => {
    const callOrder: string[] = [];
    (setCustomizeWizardVMSignal as jest.Mock).mockImplementation(() => callOrder.push('setSignal'));
    (cancelAllWizardPendingUploads as jest.Mock).mockImplementation(() =>
      callOrder.push('cancelUploads'),
    );

    clearVMPendingUploadsAndSignal();

    expect(callOrder).toEqual(['setSignal', 'cancelUploads']);
  });

  it('clears the signal with null', () => {
    clearVMPendingUploadsAndSignal();

    expect(setCustomizeWizardVMSignal).toHaveBeenCalledWith(null);
  });

  it('cancels all pending wizard uploads', () => {
    clearVMPendingUploadsAndSignal();

    expect(cancelAllWizardPendingUploads).toHaveBeenCalledTimes(1);
  });
});
