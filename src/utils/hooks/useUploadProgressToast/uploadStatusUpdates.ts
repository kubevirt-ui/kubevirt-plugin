import { isEmpty } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from './constants';
import { type CompleteUploadOptions, type UploadEntry } from './uploads/types/types';

type UploadsDataState = {
  data: Record<string, UploadEntry>;
};

const canUpdateUploadingEntry = (
  current: UploadEntry | undefined,
  expectedGeneration?: number,
): current is UploadEntry =>
  current?.status === UPLOAD_PROGRESS_STATUS.UPLOADING &&
  (expectedGeneration === undefined || current.generation === expectedGeneration);

const omitRemovedSuccessLinks = (
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

export const completeUploadState = (
  state: UploadsDataState,
  uploadKey: string,
  options?: CompleteUploadOptions,
): UploadsDataState => {
  const current = state.data?.[uploadKey];
  const completeOptions = options ?? {};
  if (!canUpdateUploadingEntry(current, completeOptions.expectedGeneration)) {
    return state;
  }

  const successLinks = omitRemovedSuccessLinks(
    completeOptions.successLinks ?? current.successLinks,
    current.omittedLinkUrls,
  );

  return {
    data: {
      ...state.data,
      [uploadKey]: {
        ...current,
        progress: 100,
        resourceName: completeOptions.resourceName ?? current.resourceName,
        resourceUrl: completeOptions.resourceUrl ?? current.resourceUrl,
        status: UPLOAD_PROGRESS_STATUS.SUCCESS,
        successLinks,
      },
    },
  };
};

export const failUploadState = (
  state: UploadsDataState,
  uploadKey: string,
  errorMessage: string,
  expectedGeneration?: number,
): UploadsDataState => {
  const current = state.data?.[uploadKey];
  if (!canUpdateUploadingEntry(current, expectedGeneration)) {
    return state;
  }

  return {
    data: {
      ...state.data,
      [uploadKey]: {
        ...current,
        errorMessage,
        status: UPLOAD_PROGRESS_STATUS.ERROR,
      },
    },
  };
};

export const markUploadCanceledState = (
  state: UploadsDataState,
  uploadKey: string,
  expectedGeneration?: number,
): UploadsDataState => {
  const current = state.data?.[uploadKey];
  if (!current || (expectedGeneration !== undefined && current.generation !== expectedGeneration)) {
    return state;
  }

  return {
    data: {
      ...state.data,
      [uploadKey]: {
        ...current,
        status: UPLOAD_PROGRESS_STATUS.CANCELED,
      },
    },
  };
};
