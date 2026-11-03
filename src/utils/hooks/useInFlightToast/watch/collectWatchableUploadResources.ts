import { type UploadsStoreSliceData } from '../features/uploads/types/types';
import { type UploadLinkedResource, type UploadSuccessLink } from '../shared/types/types';

export const getUploadLinkedResourceWatchKey = (resource: UploadLinkedResource): string =>
  [
    resource.cluster ?? '',
    resource.groupVersionKind.group ?? '',
    resource.groupVersionKind.version,
    resource.groupVersionKind.kind,
    resource.namespace ?? '',
    resource.name,
  ].join('/');

const collectLinkResources = (links: UploadSuccessLink[] | undefined): UploadLinkedResource[] =>
  (links ?? []).flatMap((link) => (link.resource?.name ? [link.resource] : []));

export const collectWatchableUploadResources = (
  uploadsData: UploadsStoreSliceData,
): UploadLinkedResource[] => {
  const resourcesByKey = new Map<string, UploadLinkedResource>();

  for (const upload of Object.values(uploadsData)) {
    for (const resource of [
      ...collectLinkResources(upload.progressToastState.contextLinks),
      ...collectLinkResources(upload.progressToastState.successLinks),
    ]) {
      const key = getUploadLinkedResourceWatchKey(resource);
      if (!resourcesByKey.has(key)) {
        resourcesByKey.set(key, resource);
      }
    }
  }

  return [...resourcesByKey.values()];
};
