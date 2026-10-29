import {
  getBootableVolumeUrl,
  getDataVolumeUrl,
  getVmStorageUrlForIdentity,
  omitLinksByUrl,
} from '../completion/uploadLinks';
import { type UploadsStoreSliceData } from '../features/uploads/types/types';
import { type ProgressToastState } from '../shared/types/types';

export const getVmStorageUrls = (cluster: string, namespace: string, vmName: string): Set<string> =>
  new Set([
    getVmStorageUrlForIdentity(cluster || undefined, namespace, vmName),
    getVmStorageUrlForIdentity(undefined, namespace, vmName),
  ]);

export const getDataVolumeUrls = (upload: ProgressToastState): Set<string> =>
  upload.dvName && upload.dvNamespace
    ? new Set([
        getDataVolumeUrl(upload.dvName, upload.dvNamespace, upload.dvCluster),
        getDataVolumeUrl(upload.dvName, upload.dvNamespace),
      ])
    : new Set<string>();

export const matchesUploadCluster = (upload: ProgressToastState, cluster?: string): boolean =>
  (upload.dvCluster ?? '') === (cluster ?? '');

export const collectLinkUrls = (upload: ProgressToastState): string[] => [
  ...(upload.contextLinks ?? []).map((link) => link.url),
  ...(upload.successLinks ?? []).map((link) => link.url),
];

const mergeOmittedLinkUrls = (
  existing: string[] | undefined,
  urlsToOmit: Set<string>,
): string[] => {
  if (!existing?.length) {
    return [...urlsToOmit];
  }

  const merged = new Set(existing);
  const sizeBefore = merged.size;
  urlsToOmit.forEach((url) => merged.add(url));
  return merged.size === sizeBefore ? existing : [...merged];
};

export const omitUploadLinksByUrl = (
  upload: ProgressToastState,
  urlsToOmit: Set<string>,
): ProgressToastState => {
  if (urlsToOmit.size === 0) {
    return upload;
  }

  const contextLinks = omitLinksByUrl(upload.contextLinks, urlsToOmit);
  const successLinks = omitLinksByUrl(upload.successLinks, urlsToOmit);
  const omittedLinkUrls = mergeOmittedLinkUrls(upload.omittedLinkUrls, urlsToOmit);

  if (
    contextLinks === upload.contextLinks &&
    successLinks === upload.successLinks &&
    omittedLinkUrls === upload.omittedLinkUrls
  ) {
    return upload;
  }

  return { ...upload, contextLinks, omittedLinkUrls, successLinks };
};

export const updateUploads = (
  uploadsData: UploadsStoreSliceData,
  getUrlsToOmit: (key: string, upload: ProgressToastState) => Set<string>,
  keysToProcess = Object.keys(uploadsData),
): UploadsStoreSliceData => {
  let changed = false;
  const nextUploads = { ...uploadsData };

  for (const key of keysToProcess) {
    const current = nextUploads[key].progressToastState;
    if (!current) {
      continue;
    }

    const nextUpload = omitUploadLinksByUrl(current, getUrlsToOmit(key, current));
    if (nextUpload === current) {
      continue;
    }

    changed = true;
    nextUploads[key].progressToastState = nextUpload;
  }

  return changed ? nextUploads : uploadsData;
};

export const getBootableVolumeUrlsToOmit = (
  name: string,
  namespace: string,
  cluster?: string,
): Set<string> =>
  new Set([getBootableVolumeUrl(name, namespace, cluster), getBootableVolumeUrl(name, namespace)]);
