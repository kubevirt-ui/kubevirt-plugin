import { type UploadEntry } from '../types';

import {
  getBootableVolumeUrl,
  getDataVolumeUrl,
  getVmStorageUrlForIdentity,
  omitLinksByUrl,
} from '../completion/uploadLinks';
import {
  collectVmScopedUploadKeys,
  getBootableVolumeUploadKey,
  UPLOAD_KEY_PREFIX,
} from '../keys/uploadKeys';

const getVmStorageUrls = (cluster: string, namespace: string, vmName: string): Set<string> =>
  new Set([
    getVmStorageUrlForIdentity(cluster || undefined, namespace, vmName),
    getVmStorageUrlForIdentity(undefined, namespace, vmName),
  ]);

const getDataVolumeUrls = (upload: UploadEntry): Set<string> =>
  upload.dvName && upload.dvNamespace
    ? new Set([getDataVolumeUrl(upload.dvName, upload.dvNamespace)])
    : new Set<string>();

const matchesUploadCluster = (upload: UploadEntry, cluster?: string): boolean =>
  (upload.dvCluster ?? '') === (cluster ?? '');

const collectLinkUrls = (upload: UploadEntry): string[] => [
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

const omitUploadLinksByUrl = (upload: UploadEntry, urlsToOmit: Set<string>): UploadEntry => {
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

const updateUploads = (
  uploads: Record<string, UploadEntry>,
  getUrlsToOmit: (key: string, upload: UploadEntry) => Set<string>,
  keysToProcess = Object.keys(uploads),
): Record<string, UploadEntry> => {
  let changed = false;
  const nextUploads = { ...uploads };

  for (const key of keysToProcess) {
    const current = nextUploads[key];
    if (!current) {
      continue;
    }

    const nextUpload = omitUploadLinksByUrl(current, getUrlsToOmit(key, current));
    if (nextUpload === current) {
      continue;
    }

    changed = true;
    nextUploads[key] = nextUpload;
  }

  return changed ? nextUploads : uploads;
};

export const stripDataVolumeLinksFromUpload = (upload: UploadEntry): UploadEntry =>
  omitUploadLinksByUrl(upload, getDataVolumeUrls(upload));

export const stripLinksForDeletedDataVolume = (
  uploads: Record<string, UploadEntry>,
  dvName: string,
  dvNamespace: string,
  cluster?: string,
): Record<string, UploadEntry> => {
  if (!dvName || !dvNamespace) {
    return uploads;
  }

  const dataVolumeUrl = getDataVolumeUrl(dvName, dvNamespace);

  return updateUploads(uploads, (key, upload) => {
    const matchesVolume =
      upload.dvName === dvName &&
      upload.dvNamespace === dvNamespace &&
      matchesUploadCluster(upload, cluster);

    if (!matchesVolume) {
      return new Set();
    }

    const urlsToOmit = new Set([dataVolumeUrl]);
    if (key.startsWith(`${UPLOAD_KEY_PREFIX.bootableVolume}/`)) {
      for (const url of collectLinkUrls(upload)) {
        urlsToOmit.add(url);
      }
    }

    return urlsToOmit;
  });
};

export const stripLinksForDeletedBootableVolume = (
  uploads: Record<string, UploadEntry>,
  namespace: string,
  name: string,
  cluster?: string,
): Record<string, UploadEntry> => {
  if (!namespace || !name) {
    return uploads;
  }

  const matchingKeys = new Set([
    getBootableVolumeUploadKey(namespace, name, cluster),
    getBootableVolumeUploadKey(namespace, name),
  ]);
  const urlsToOmit = new Set([
    getBootableVolumeUrl(name, namespace, cluster),
    getBootableVolumeUrl(name, namespace),
  ]);

  return updateUploads(uploads, (key, upload) => {
    if (!matchingKeys.has(key) || !matchesUploadCluster(upload, cluster)) {
      return new Set();
    }

    for (const url of collectLinkUrls(upload)) {
      urlsToOmit.add(url);
    }

    return urlsToOmit;
  });
};

export const stripVmStorageLinksFromUploads = (
  uploads: Record<string, UploadEntry>,
  cluster: string,
  namespace: string,
  vmName: string,
  uploadKeys?: string[],
): Record<string, UploadEntry> => {
  const matchingKeys = uploadKeys ?? collectVmScopedUploadKeys(uploads, cluster, namespace, vmName);
  if (matchingKeys.length === 0) {
    return uploads;
  }

  const vmStorageUrls = getVmStorageUrls(cluster, namespace, vmName);

  return updateUploads(
    uploads,
    (_key, upload) => new Set([...vmStorageUrls, ...getDataVolumeUrls(upload)]),
    matchingKeys,
  );
};
