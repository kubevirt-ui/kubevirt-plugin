import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { ClusterServiceVersionKind } from './types';

export const buildUrlForCSVSubscription = (model: K8sModel, name?: string, namespace?: string) => {
  const url = ['/k8s'];
  url.push(namespace ? `/ns/${namespace}/` : '/all-namespaces/');
  url.push(modelToRef(model));
  url.push(`/${encodeURIComponent(name)}`);
  url.push('/subscription');

  return url.join('');
};

export const isNewBadgeNeeded = (installedCSV: ClusterServiceVersionKind) => {
  const installationDate = new Date(installedCSV?.metadata?.creationTimestamp);
  const now = new Date();
  const twoWeeksMilliseconds = 14 * 24 * 60 * 60 * 1000;
  // if older then 2 weeks return false
  return now.getTime() - installationDate.getTime() < twoWeeksMilliseconds;
};
