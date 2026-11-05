import { AlertVariant } from '@patternfly/react-core';

import { getToastMapperByVariant, syncWatchedResourceToast } from './displayWatchedResourceToast';

describe('displayWatchedResourceToast', () => {
  const toastHelpers = {
    addDangerToast: jest.fn(),
    addInfoToast: jest.fn(),
    addSuccessToast: jest.fn(),
    addWarningToast: jest.fn(),
    removeToast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should map toast variants to the matching helper', () => {
    const toastHelperByVariant = getToastMapperByVariant(toastHelpers);

    expect(toastHelperByVariant[AlertVariant.danger]).toBe(toastHelpers.addDangerToast);
    expect(toastHelperByVariant[AlertVariant.success]).toBe(toastHelpers.addSuccessToast);
  });

  it('should call the toast helper that matches the toast variant with the toast id', () => {
    const toastOptions = { content: 'done', title: 'Clone VM', variant: AlertVariant.success };

    syncWatchedResourceToast(toastOptions, toastHelpers, 'clone-vm-1');

    expect(toastHelpers.addSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({
        ...toastOptions,
        id: 'clone-vm-1',
        onRemove: expect.any(Function),
      }),
    );
    expect(toastHelpers.addDangerToast).not.toHaveBeenCalled();
  });

  it('should still pass onRemove for dismiss cleanup', () => {
    const toastOptions = { content: 'done', title: 'Clone VM', variant: AlertVariant.success };

    syncWatchedResourceToast(toastOptions, toastHelpers, 'clone-vm-1');

    expect(toastHelpers.addSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({ onRemove: expect.any(Function) }),
    );
  });
});
