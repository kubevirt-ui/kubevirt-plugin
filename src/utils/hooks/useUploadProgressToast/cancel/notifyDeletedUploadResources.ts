import { useUploadProgressStore } from '../uploadProgressStore';

export const notifyDataVolumeDeleted = (
  name?: string,
  namespace?: string,
  cluster?: string,
): void => {
  if (!name || !namespace) {
    return;
  }

  useUploadProgressStore
    .getState()
    .uploads.actions?.stripDataVolumeLinksForResource(name, namespace, cluster);
};

export const notifyBootableVolumeDeleted = (
  name?: string,
  namespace?: string,
  cluster?: string,
): void => {
  if (!name || !namespace) {
    return;
  }

  useUploadProgressStore
    .getState()
    .uploads.actions?.stripBootableVolumeLinks(namespace, name, cluster);
};
