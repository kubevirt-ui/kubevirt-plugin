import { UPLOAD_PROGRESS_STATUS } from '../constants';

import {
  DISK_NAME,
  ERROR_UPLOAD_FAILED,
  FILE_IMAGE_ISO,
  LINK_LABEL_EXISTING,
  LINK_LABEL_VIEW_DISK,
  LINK_URL_DISK,
  LINK_URL_EXISTING,
  MISSING_KEY,
  type SliceTestHelper,
  UPLOAD_KEY,
} from './inFlightToastStore.test';

export const describeCompleteUpload = (slice: SliceTestHelper): void => {
  it('should set SUCCESS status, progress 100, and merge successLinks and resourceName', () => {
    slice.startUpload(UPLOAD_KEY, {
      fileName: FILE_IMAGE_ISO,
      successLinks: [{ label: LINK_LABEL_EXISTING, url: LINK_URL_EXISTING }],
    });

    slice.getActions()?.completeUpload(UPLOAD_KEY, {
      resourceName: DISK_NAME,
      successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
    });

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);

    expect(upload).toMatchObject({
      progress: 100,
      resourceName: DISK_NAME,
      status: UPLOAD_PROGRESS_STATUS.SUCCESS,
      successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
    });
  });

  it('should no-op when upload key does not exist', () => {
    slice.getActions()?.completeUpload(MISSING_KEY);

    expect(slice.getData()).toEqual({});
  });

  it('should not overwrite a canceled upload', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.getActions()?.markUploadCanceled(UPLOAD_KEY);

    slice.getActions()?.completeUpload(UPLOAD_KEY, {
      successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
    });

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
    expect(upload?.successLinks).toBeUndefined();
  });

  it('should not overwrite a retried upload with a stale generation', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    slice.getActions()?.completeUpload(UPLOAD_KEY, {
      expectedGeneration: 1,
      successLinks: [{ label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK }],
    });

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);
    expect(upload?.generation).toBe(2);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    expect(upload?.successLinks).toBeUndefined();
  });

  it('should omit success links that were stripped before completion', () => {
    const omittedUrl = '/k8s/ns/default/datavolumes/dv-disk-0';
    slice.startUpload(UPLOAD_KEY, {
      fileName: FILE_IMAGE_ISO,
      omittedLinkUrls: [omittedUrl],
    });

    slice.getActions()?.completeUpload(UPLOAD_KEY, {
      successLinks: [
        { label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK },
        { label: 'View DataVolume', url: omittedUrl },
      ],
    });

    expect(slice.getActions()?.getUpload(UPLOAD_KEY)?.successLinks).toEqual([
      { label: LINK_LABEL_VIEW_DISK, url: LINK_URL_DISK },
    ]);
  });
};

export const describeFailUpload = (slice: SliceTestHelper): void => {
  it('should set ERROR status and store error message', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    slice.getActions()?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED);

    expect(slice.getActions()?.getUpload(UPLOAD_KEY)).toMatchObject({
      errorMessage: ERROR_UPLOAD_FAILED,
      status: UPLOAD_PROGRESS_STATUS.ERROR,
    });
  });

  it('should no-op when upload key does not exist', () => {
    slice.getActions()?.failUpload(MISSING_KEY, ERROR_UPLOAD_FAILED);

    expect(slice.getData()).toEqual({});
  });

  it('should not overwrite a canceled upload', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.getActions()?.markUploadCanceled(UPLOAD_KEY);

    slice.getActions()?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED);

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.CANCELED);
    expect(upload?.errorMessage).toBeUndefined();
  });

  it('should not overwrite a retried upload with a stale generation', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    slice.getActions()?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED, 1);

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);
    expect(upload?.generation).toBe(2);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    expect(upload?.errorMessage).toBeUndefined();
  });

  it('should not fail a later upload after the previous entry was removed', () => {
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });
    slice.getActions()?.removeUpload(UPLOAD_KEY);
    slice.startUpload(UPLOAD_KEY, { fileName: FILE_IMAGE_ISO });

    slice.getActions()?.failUpload(UPLOAD_KEY, ERROR_UPLOAD_FAILED, 1);

    const upload = slice.getActions()?.getUpload(UPLOAD_KEY);
    expect(upload?.generation).toBe(2);
    expect(upload?.status).toBe(UPLOAD_PROGRESS_STATUS.UPLOADING);
    expect(upload?.errorMessage).toBeUndefined();
  });
};
