import { type ClusterServiceVersionKind } from '@kubevirt-utils/types/olm';

export const isNewBadgeNeeded = (installedCSV: ClusterServiceVersionKind): boolean => {
  const installationDate = new Date(installedCSV?.metadata?.creationTimestamp);
  const now = new Date();
  const twoWeeksMilliseconds = 14 * 24 * 60 * 60 * 1000;
  // if older then 2 weeks return false
  return now.getTime() - installationDate.getTime() < twoWeeksMilliseconds;
};
