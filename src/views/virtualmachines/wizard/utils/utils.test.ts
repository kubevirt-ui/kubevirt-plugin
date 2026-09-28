import { cancelAllWizardPendingUploads } from '@kubevirt-utils/hooks/useUploadProgressToast';

import { clearWizardPendingUploads } from './utils';

jest.mock('@kubevirt-utils/hooks/useUploadProgressToast', () => ({
  cancelAllWizardPendingUploads: jest.fn(),
}));

describe('clearWizardPendingUploads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cancels pending wizard uploads', () => {
    clearWizardPendingUploads();

    expect(cancelAllWizardPendingUploads).toHaveBeenCalledTimes(1);
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith();
  });
});
