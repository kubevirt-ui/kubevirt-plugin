import { cancelAllWizardPendingUploads } from '@kubevirt-utils/hooks/useUploadProgressToast';

import { discardGeneratedVMDraft } from './generatedVMDraft';
import { clearVMPendingUploadsAndSignal } from './utils';

jest.mock('@kubevirt-utils/hooks/useUploadProgressToast', () => ({
  cancelAllWizardPendingUploads: jest.fn(),
}));

jest.mock('./generatedVMDraft', () => ({
  discardGeneratedVMDraft: jest.fn(),
}));

describe('clearVMPendingUploadsAndSignal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cancels wizard pending uploads before clearing the signal', () => {
    const callOrder: string[] = [];
    (discardGeneratedVMDraft as jest.Mock).mockImplementation(() => callOrder.push('setSignal'));
    (cancelAllWizardPendingUploads as jest.Mock).mockImplementation(() =>
      callOrder.push('cancelUploads'),
    );

    clearVMPendingUploadsAndSignal();

    expect(callOrder).toEqual(['cancelUploads', 'setSignal']);
  });

  it('discards the generated VM draft', () => {
    clearVMPendingUploadsAndSignal();

    expect(discardGeneratedVMDraft).toHaveBeenCalledTimes(1);
  });

  it('cancels pending wizard uploads', () => {
    clearVMPendingUploadsAndSignal();

    expect(cancelAllWizardPendingUploads).toHaveBeenCalledTimes(1);
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith();
  });
});
