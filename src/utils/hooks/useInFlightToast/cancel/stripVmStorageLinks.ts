import { getDataVolumeUrl } from '../completion/uploadLinks';
import { type UploadsStoreSliceData } from '../features/uploads/types/types';
import {
  collectVmScopedUploadKeys,
  getBootableVolumeUploadKey,
  isBootableVolumeUploadKey,
} from '../keys/uploadKeys';
import { type ProgressToastState } from '../shared/types/types';
import {
  collectLinkUrls,
  getBootableVolumeUrlsToOmit,
  getDataVolumeUrls,
  getVmStorageUrls,
  matchesUploadCluster,
  omitUploadLinksByUrl,
  updateUploads,
} from './stripUploadLinksUtils';

export const stripDataVolumeLinksFromUpload = (
  upload: ProgressToastState,
  uploadKey?: string,
): ProgressToastState => {
  const urlsToOmit = getDataVolumeUrls(upload);

  if (uploadKey && isBootableVolumeUploadKey(uploadKey)) {
    for (const url of collectLinkUrls(upload)) {
      urlsToOmit.add(url);
    }
  }

  return omitUploadLinksByUrl(upload, urlsToOmit);
};

export const stripLinksForDeletedDataVolume = (
  uploadsData: UploadsStoreSliceData,
  dvName: string,
  dvNamespace: string,
  cluster?: string,
): UploadsStoreSliceData => {
  if (!dvName || !dvNamespace) {
    return uploadsData;
  }

  const urlsToOmitForVolume = new Set([
    getDataVolumeUrl(dvName, dvNamespace, cluster),
    getDataVolumeUrl(dvName, dvNamespace),
  ]);

  return updateUploads(uploadsData, (key, upload) => {
    const matchesVolume =
      upload.dvName === dvName &&
      upload.dvNamespace === dvNamespace &&
      matchesUploadCluster(upload, cluster);

    if (!matchesVolume) {
      return new Set();
    }

    const urlsToOmit = new Set(urlsToOmitForVolume);
    if (isBootableVolumeUploadKey(key)) {
      for (const url of collectLinkUrls(upload)) {
        urlsToOmit.add(url);
      }
    }

    return urlsToOmit;
  });
};

export const stripLinksForDeletedBootableVolume = (
  uploadsData: UploadsStoreSliceData,
  namespace: string,
  name: string,
  cluster?: string,
): UploadsStoreSliceData => {
  if (!namespace || !name) {
    return uploadsData;
  }

  const matchingKeys = new Set([
    getBootableVolumeUploadKey(namespace, name, cluster),
    getBootableVolumeUploadKey(namespace, name),
  ]);
  const urlsToOmit = getBootableVolumeUrlsToOmit(name, namespace, cluster);

  return updateUploads(uploadsData, (key, upload) => {
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
  uploadsData: UploadsStoreSliceData,
  cluster: string,
  namespace: string,
  vmName: string,
  uploadKeys?: string[],
): UploadsStoreSliceData => {
  const matchingKeys =
    uploadKeys ?? collectVmScopedUploadKeys(uploadsData, cluster, namespace, vmName);
  if (matchingKeys.length === 0) {
    return uploadsData;
  }

  const vmStorageUrls = getVmStorageUrls(cluster, namespace, vmName);

  return updateUploads(
    uploadsData,
    (_key, upload) => new Set([...vmStorageUrls, ...getDataVolumeUrls(upload)]),
    matchingKeys,
  );
};
