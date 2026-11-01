import { getUploadsActions } from '../shared/selectors/inFlightToastStoreSelectors';

export const notifyDataVolumeDeleted = (
  name?: string,
  namespace?: string,
  cluster?: string,
): void => {
  if (!name || !namespace) {
    return;
  }

  getUploadsActions().stripDataVolumeLinksForResource(name, namespace, cluster);
};

export const notifyBootableVolumeDeleted = (
  name?: string,
  namespace?: string,
  cluster?: string,
): void => {
  if (!name || !namespace) {
    return;
  }

  getUploadsActions().stripBootableVolumeLinks(namespace, name, cluster);
};
