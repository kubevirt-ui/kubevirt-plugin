import { type UploadEntry } from '../types';

import { getDataVolumeUrl } from '../completion/uploadLinks';
import {
  collectVmScopedUploadKeys,
  getBootableVolumeUploadKey,
  UPLOAD_KEY_PREFIX,
} from '../keys/uploadKeys';
import {
  collectLinkUrls,
  getBootableVolumeUrlsToOmit,
  getDataVolumeUrls,
  getVmStorageUrls,
  matchesUploadCluster,
  omitUploadLinksByUrl,
  updateUploads,
} from './stripUploadLinksUtils';

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

  const urlsToOmitForVolume = new Set([
    getDataVolumeUrl(dvName, dvNamespace, cluster),
    getDataVolumeUrl(dvName, dvNamespace),
  ]);

  return updateUploads(uploads, (key, upload) => {
    const matchesVolume =
      upload.dvName === dvName &&
      upload.dvNamespace === dvNamespace &&
      matchesUploadCluster(upload, cluster);

    if (!matchesVolume) {
      return new Set();
    }

    const urlsToOmit = new Set(urlsToOmitForVolume);
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
  const urlsToOmit = getBootableVolumeUrlsToOmit(name, namespace, cluster);

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
