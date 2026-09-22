import type { UploadEntry, UploadLinkedResource, UploadSuccessLink } from '../types';

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
  uploads: Record<string, UploadEntry>,
): UploadLinkedResource[] => {
  const resourcesByKey = new Map<string, UploadLinkedResource>();

  for (const upload of Object.values(uploads)) {
    for (const resource of [
      ...collectLinkResources(upload.contextLinks),
      ...collectLinkResources(upload.successLinks),
    ]) {
      const key = getUploadLinkedResourceWatchKey(resource);
      if (!resourcesByKey.has(key)) {
        resourcesByKey.set(key, resource);
      }
    }
  }

  return [...resourcesByKey.values()];
};
