import { isEmpty } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from './constants';
import { getProgressToastState } from './shared/selectors/uploadEntrySelectors';
import { type UploadEntry, type UploadsStoreStateData } from './uploads/types/types';

export const canUpdateUploadingEntry = (
  current: UploadEntry | undefined,
  expectedGeneration?: number,
): current is UploadEntry =>
  current?.status === UPLOAD_PROGRESS_STATUS.UPLOADING &&
  (expectedGeneration === undefined || current.generation === expectedGeneration);

export const omitRemovedSuccessLinks = (
  links: UploadEntry['successLinks'],
  omittedLinkUrls?: string[],
): UploadEntry['successLinks'] => {
  if (isEmpty(links) || isEmpty(omittedLinkUrls)) {
    return links;
  }

  const omitted = new Set(omittedLinkUrls);
  const filtered = links.filter((link) => !omitted.has(link.url));
  return filtered.length === links.length ? links : filtered;
};

export const failUploadState = (
  data: UploadsStoreStateData,
  uploadKey: string,
  errorMessage: string,
  expectedGeneration?: number,
): UploadsStoreStateData => {
  const currentEntry = data?.[uploadKey];
  const current = getProgressToastState(currentEntry);

  if (!canUpdateUploadingEntry(current, expectedGeneration)) {
    return data;
  }

  return {
    ...data,
    [uploadKey]: {
      ...(currentEntry ?? {}),
      progressToastState: {
        ...current,
        errorMessage,
        status: UPLOAD_PROGRESS_STATUS.ERROR,
      },
    },
  };
};

export const markUploadCanceledState = (
  data: UploadsStoreStateData,
  uploadKey: string,
  expectedGeneration?: number,
): { data: UploadsStoreStateData } => {
  const entry = data?.[uploadKey];
  const toastState = getProgressToastState(entry);
  if (
    !toastState ||
    (expectedGeneration !== undefined && toastState.generation !== expectedGeneration)
  ) {
    return { data };
  }

  return {
    data: {
      ...data,
      [uploadKey]: {
        ...entry,
        progressToastState: {
          ...toastState,
          status: UPLOAD_PROGRESS_STATUS.CANCELED,
        },
      },
    },
  };
};
