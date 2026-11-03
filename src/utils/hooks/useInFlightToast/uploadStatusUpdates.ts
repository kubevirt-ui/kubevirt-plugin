import { isEmpty } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from './constants';
import { type UploadsStoreSliceData } from './features/uploads/types/types';
import { getProgressToastState } from './shared/selectors/uploadEntrySelectors';
import { type ProgressToastState } from './shared/types/types';

export const canUpdateUploadingEntry = (
  current: ProgressToastState | undefined,
  expectedGeneration?: number,
): current is ProgressToastState =>
  current?.status === UPLOAD_PROGRESS_STATUS.UPLOADING &&
  (expectedGeneration === undefined || current.generation === expectedGeneration);

export const omitRemovedSuccessLinks = (
  links: ProgressToastState['successLinks'],
  omittedLinkUrls?: string[],
): ProgressToastState['successLinks'] => {
  if (isEmpty(links) || isEmpty(omittedLinkUrls)) {
    return links;
  }

  const omitted = new Set(omittedLinkUrls);
  const filtered = links.filter((link) => !omitted.has(link.url));
  return filtered.length === links.length ? links : filtered;
};

export const failUploadState = (
  data: UploadsStoreSliceData,
  uploadKey: string,
  errorMessage: string,
  expectedGeneration?: number,
): UploadsStoreSliceData => {
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
  data: UploadsStoreSliceData,
  uploadKey: string,
  expectedGeneration?: number,
): { data: UploadsStoreSliceData } => {
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
