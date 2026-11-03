import { act, renderHook } from '@testing-library/react';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { resetInFlightToastStore, useInFlightToastStore } from '../inFlightToastStore';

import useUploadBeforeUnload from './useUploadBeforeUnload';

const UPLOAD_KEY = 'test-upload-key';
const FILE_IMAGE_ISO = 'image.iso';

const resetStore = (): void => {
  resetInFlightToastStore();
};

describe('useUploadBeforeUnload', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    resetStore();
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    act(() => {
      resetStore();
    });
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should not register beforeunload listener when no uploads are active', () => {
    renderHook(() => useUploadBeforeUnload());

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should register beforeunload listener when an upload is in progress', () => {
    const { rerender } = renderHook(() => useUploadBeforeUnload());

    act(() => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    });
    rerender();

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should remove beforeunload listener when upload completes', () => {
    const { rerender } = renderHook(() => useUploadBeforeUnload());

    act(() => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    });
    rerender();

    const handler = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'beforeunload',
    )?.[1] as EventListener;

    act(() => {
      useInFlightToastStore.getState().uploads.actions?.completeUpload(UPLOAD_KEY);
    });
    rerender();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', handler);
  });

  it('should call preventDefault on beforeunload when uploads are active', () => {
    const { rerender } = renderHook(() => useUploadBeforeUnload());

    act(() => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    });
    rerender();

    const handler = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === 'beforeunload',
    )?.[1] as (event: BeforeUnloadEvent) => void;

    const event = {
      preventDefault: jest.fn(),
    } as unknown as BeforeUnloadEvent;

    handler(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not register listener for terminal upload statuses', () => {
    act(() => {
      useInFlightToastStore
        .getState()
        .uploads.actions?.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
      useInFlightToastStore.setState((state) => ({
        uploads: {
          ...state.uploads,
          data: {
            [UPLOAD_KEY]: {
              progressToastState: {
                fileName: FILE_IMAGE_ISO,
                progress: 100,
                status: UPLOAD_PROGRESS_STATUS.SUCCESS,
              },
            },
          },
        },
      }));
    });

    renderHook(() => useUploadBeforeUnload());

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should not register listener when blockNavigation is false', () => {
    const { rerender } = renderHook(() => useUploadBeforeUnload());

    act(() => {
      useInFlightToastStore.getState().uploads.actions?.startUpload(UPLOAD_KEY, {
        blockNavigation: false,
        fileName: FILE_IMAGE_ISO,
      });
    });
    rerender();

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});
