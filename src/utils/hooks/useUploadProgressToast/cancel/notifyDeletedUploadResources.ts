import { useUploadProgressStore } from '../uploadProgressStore';

export const notifyDataVolumeDeleted = (
  name?: string,
  namespace?: string,
  cluster?: string,
): void => {
  if (!name || !namespace) {
    return;
  }

  useUploadProgressStore.getState().stripDataVolumeLinksForResource(name, namespace, cluster);
};

export const notifyBootableVolumeDeleted = (
  name?: string,
  namespace?: string,
  cluster?: string,
): void => {
  if (!name || !namespace) {
    return;
  }

  useUploadProgressStore.getState().stripBootableVolumeLinks(namespace, name, cluster);
};
