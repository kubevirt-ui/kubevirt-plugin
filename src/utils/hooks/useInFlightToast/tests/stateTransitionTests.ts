import { UPLOAD_PROGRESS_STATUS } from '../constants';

import {
  FILE_IMAGE_ISO,
  MISSING_KEY,
  type SliceTestHelper,
  UPLOAD_KEY,
} from './inFlightToastStore.test';

export const describeStartUpload = (slice: SliceTestHelper): void => {
  it('should initialize entry with UPLOADING status and progress 0', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);

    expect(upload).toMatchObject({
      blockNavigation: true,
      fileName: FILE_IMAGE_ISO,
      generation: 1,
      progress: 0,
      status: UPLOAD_PROGRESS_STATUS.UPLOADING,
    });
  });

  it('should keep incrementing generation after the upload entry is removed', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.getActions()?.removeUpload(UPLOAD_KEY);

    const generation = slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    expect(generation).toBe(2);
    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.generation).toBe(2);
  });
};

export const describeUpdateProgress = (slice: SliceTestHelper): void => {
  it('should update progress when status is UPLOADING', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    slice.getActions()?.updateProgress(UPLOAD_KEY, 50);

    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.progress).toBe(50);
  });

  it('should not update progress when status is terminal', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.getActions()?.completeUpload(UPLOAD_KEY);

    slice.getActions()?.updateProgress(UPLOAD_KEY, 50);

    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.progress).toBe(100);
  });

  it('should no-op when upload key does not exist', () => {
    slice.getActions()?.updateProgress(MISSING_KEY, 50);

    expect(slice.getData()).toEqual({});
  });
};

export const describeMarkUploadCanceled = (slice: SliceTestHelper): void => {
  it('should set CANCELED status', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    slice.getActions()?.markUploadCanceled(UPLOAD_KEY);

    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
  });

  it('should no-op when upload key does not exist', () => {
    slice.getActions()?.markUploadCanceled(MISSING_KEY);

    expect(slice.getData()).toEqual({});
  });

  it('should not cancel a later upload with a stale generation', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.getActions()?.removeUpload(UPLOAD_KEY);
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    slice.getActions()?.markUploadCanceled(UPLOAD_KEY, 1);

    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.status).toBe(
      UPLOAD_PROGRESS_STATUS.UPLOADING,
    );
  });
};
