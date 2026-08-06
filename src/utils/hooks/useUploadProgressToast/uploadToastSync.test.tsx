import React from 'react';
import { TFunction } from 'i18next';

import { UPLOAD_PROGRESS_STATUS } from './constants';
import { UploadEntry } from './types';
import { useUploadProgressStore } from './uploadProgressStore';
import {
  replaceWithTerminalUploadToast,
  showInProgressUploadToast,
  syncUploadToasts,
} from './uploadToastSync';

jest.mock('./components/UploadProgressToastContent', () => () => <div>toast-content</div>);
jest.mock('./toast/uploadTitles', () => ({
  getUploadTitle: (_upload: UploadEntry, t: (s: string) => string) => t('Uploading'),
  isTerminalUploadStatus: jest.fn(
    (status) => status === 'success' || status === 'error' || status === 'canceled',
  ),
}));

const UPLOAD_KEY = 'test-upload-key';
const TOAST_ID = 'toast-123';

type MockToastOptions = { onClose?: () => void } & Record<string, unknown>;

const createMockContext = () => ({
  addDangerToast: jest.fn((_options: MockToastOptions) => 'danger-toast-id'),
  addInfoToast: jest.fn((_options: MockToastOptions) => TOAST_ID),
  addSuccessToast: jest.fn((_options: MockToastOptions) => 'success-toast-id'),
  addWarningToast: jest.fn((_options: MockToastOptions) => 'warning-toast-id'),
  cancelTrackedUpload: jest.fn(),
  navigate: jest.fn(),
  removeToast: jest.fn(),
  removeUpload: jest.fn(),
  t: ((key: string) => key) as unknown as TFunction,
  tryMarkTerminalToastShown: jest.fn(() => true),
  trySetToastId: jest.fn(() => true),
});

const createUploadEntry = (overrides: Partial<UploadEntry> = {}): UploadEntry => ({
  fileName: 'image.iso',
  progress: 50,
  status: UPLOAD_PROGRESS_STATUS.UPLOADING,
  ...overrides,
});

describe('showInProgressUploadToast', () => {
  it('should skip if upload already has a toastId', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>();
    const upload = createUploadEntry({ toastId: 'existing-toast' });

    showInProgressUploadToast(UPLOAD_KEY, upload, context, processedToasts);

    expect(context.addInfoToast).not.toHaveBeenCalled();
    expect(processedToasts.has(UPLOAD_KEY)).toBe(false);
  });

  it('should skip if uploadKey is already in processedToasts', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>([UPLOAD_KEY]);
    const upload = createUploadEntry();

    showInProgressUploadToast(UPLOAD_KEY, upload, context, processedToasts);

    expect(context.addInfoToast).not.toHaveBeenCalled();
  });

  it('should create toast and set toastId on success', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>();
    const upload = createUploadEntry();

    showInProgressUploadToast(UPLOAD_KEY, upload, context, processedToasts);

    expect(processedToasts.has(UPLOAD_KEY)).toBe(true);
    expect(context.addInfoToast).toHaveBeenCalledTimes(1);
    expect(context.trySetToastId).toHaveBeenCalledWith(UPLOAD_KEY, TOAST_ID);
  });

  it('should pass minimizable: true so the toast can be minimized instead of cleared', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>();
    const upload = createUploadEntry();

    showInProgressUploadToast(UPLOAD_KEY, upload, context, processedToasts);

    expect(context.addInfoToast).toHaveBeenCalledWith(
      expect.objectContaining({ minimizable: true }),
    );
  });

  it('should call context.cancelTrackedUpload with the upload key when onClose fires', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>();
    const upload = createUploadEntry();

    showInProgressUploadToast(UPLOAD_KEY, upload, context, processedToasts);

    const { onClose } = context.addInfoToast.mock.calls[0][0];
    onClose?.();

    expect(context.cancelTrackedUpload).toHaveBeenCalledWith(UPLOAD_KEY);
  });

  it('should remove toast and processedToasts entry if trySetToastId fails', () => {
    const context = createMockContext();
    context.trySetToastId.mockReturnValue(false);
    const processedToasts = new Set<string>();
    const upload = createUploadEntry();

    showInProgressUploadToast(UPLOAD_KEY, upload, context, processedToasts);

    expect(context.removeToast).toHaveBeenCalledWith(TOAST_ID);
    expect(processedToasts.has(UPLOAD_KEY)).toBe(false);
  });
});

describe('replaceWithTerminalUploadToast', () => {
  afterEach(() => {
    useUploadProgressStore.setState({ uploads: {} });
  });

  it('should skip non-terminal upload statuses', () => {
    const context = createMockContext();
    const upload = createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.UPLOADING });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    expect(context.addSuccessToast).not.toHaveBeenCalled();
    expect(context.addDangerToast).not.toHaveBeenCalled();
    expect(context.addWarningToast).not.toHaveBeenCalled();
  });

  it('should skip if terminalToastShown is already true', () => {
    const context = createMockContext();
    const upload = createUploadEntry({
      status: UPLOAD_PROGRESS_STATUS.SUCCESS,
      terminalToastShown: true,
    });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    expect(context.tryMarkTerminalToastShown).not.toHaveBeenCalled();
    expect(context.addSuccessToast).not.toHaveBeenCalled();
  });

  it('should skip if tryMarkTerminalToastShown returns false', () => {
    const context = createMockContext();
    context.tryMarkTerminalToastShown.mockReturnValue(false);
    const upload = createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.SUCCESS });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    expect(context.addSuccessToast).not.toHaveBeenCalled();
  });

  it('should remove existing toast and show success toast', () => {
    const context = createMockContext();
    const upload = createUploadEntry({
      status: UPLOAD_PROGRESS_STATUS.SUCCESS,
      toastId: 'old-toast',
    });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    expect(context.removeToast).toHaveBeenCalledWith('old-toast');
    expect(context.addSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should show danger toast for error status', () => {
    const context = createMockContext();
    const upload = createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.ERROR });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    expect(context.addDangerToast).toHaveBeenCalledTimes(1);
  });

  it('should show warning toast for canceled status', () => {
    const context = createMockContext();
    const upload = createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.CANCELED });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    expect(context.addWarningToast).toHaveBeenCalledTimes(1);
  });

  it('should pass onClose that calls removeUpload (not cancelTrackedUpload) for terminal toast', () => {
    const context = createMockContext();
    const upload = createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.SUCCESS });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    const { onClose } = context.addSuccessToast.mock.calls[0][0] as MockToastOptions;
    onClose?.();

    expect(context.removeUpload).toHaveBeenCalledWith(UPLOAD_KEY);
    expect(context.cancelTrackedUpload).not.toHaveBeenCalled();
  });

  it('should not remove the store entry when a retry reused the key with a new non-terminal upload', () => {
    const context = createMockContext();
    const upload = createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.CANCELED });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    const { onClose } = context.addWarningToast.mock.calls[0][0] as MockToastOptions;

    // Simulate a retry: a new upload was started for the same uploadKey,
    // overwriting the store entry with a fresh, in-progress upload.
    useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: 'new.iso' });

    onClose?.();

    expect(context.removeUpload).not.toHaveBeenCalled();
  });

  it('should still remove the store entry on close when no retry has started', () => {
    const context = createMockContext();
    const upload = createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.CANCELED });

    replaceWithTerminalUploadToast(UPLOAD_KEY, upload, context);

    const { onClose } = context.addWarningToast.mock.calls[0][0] as MockToastOptions;

    onClose?.();

    expect(context.removeUpload).toHaveBeenCalledWith(UPLOAD_KEY);
  });

  it('should not remove the store entry when a retry has started and itself became terminal before the old toast closes', () => {
    const context = createMockContext();

    // Start the first upload through the store so it gets generation = 1.
    useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: 'image.iso' });
    useUploadProgressStore.getState().markUploadCanceled(UPLOAD_KEY);
    const canceledUpload = useUploadProgressStore.getState().getUpload(UPLOAD_KEY)!;

    replaceWithTerminalUploadToast(UPLOAD_KEY, canceledUpload, context);

    const { onClose } = context.addWarningToast.mock.calls[0][0] as MockToastOptions;

    // Retry: new upload starts (generation = 2) and quickly reaches a terminal state.
    useUploadProgressStore.getState().startUpload(UPLOAD_KEY, { fileName: 'image.iso' });
    useUploadProgressStore.getState().failUpload(UPLOAD_KEY, 'network error');

    // Closing the old canceled toast must NOT evict the retry's store entry.
    onClose?.();

    expect(context.removeUpload).not.toHaveBeenCalled();
  });
});

describe('syncUploadToasts', () => {
  it('should call showInProgressUploadToast for uploading entries', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>();
    const uploads = { [UPLOAD_KEY]: createUploadEntry() };

    syncUploadToasts(uploads, context, processedToasts);

    expect(context.addInfoToast).toHaveBeenCalledTimes(1);
    expect(processedToasts.has(UPLOAD_KEY)).toBe(true);
  });

  it('should call replaceWithTerminalUploadToast for terminal entries', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>();
    const uploads = {
      [UPLOAD_KEY]: createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.SUCCESS }),
    };

    syncUploadToasts(uploads, context, processedToasts);

    expect(context.addSuccessToast).toHaveBeenCalledTimes(1);
  });

  it('should remove terminal upload keys from processedToasts', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>([UPLOAD_KEY]);
    const uploads = {
      [UPLOAD_KEY]: createUploadEntry({ status: UPLOAD_PROGRESS_STATUS.SUCCESS }),
    };

    syncUploadToasts(uploads, context, processedToasts);

    expect(processedToasts.has(UPLOAD_KEY)).toBe(false);
  });

  it('should not re-process uploads already in processedToasts', () => {
    const context = createMockContext();
    const processedToasts = new Set<string>([UPLOAD_KEY]);
    const uploads = { [UPLOAD_KEY]: createUploadEntry() };

    syncUploadToasts(uploads, context, processedToasts);

    expect(context.addInfoToast).not.toHaveBeenCalled();
  });
});
