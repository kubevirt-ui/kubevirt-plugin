import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { HyperConverged } from './types';

export const buildUrlForCSVSubscription = (model: K8sModel, name?: string, namespace?: string) => {
  const url = ['/k8s'];
  url.push(namespace ? `/ns/${namespace}/` : '/all-namespaces/');
  url.push(modelToRef(model));
  url.push(`/${encodeURIComponent(name)}`);
  url.push('/subscription');

  return url.join('');
};

export const getHyperConvergedObject = (hyperConverged): HyperConverged => {
  if (isEmpty(hyperConverged)) return null;
  if (hyperConverged?.items) return hyperConverged?.items?.[0];
  if (Array.isArray(hyperConverged)) return hyperConverged?.[0];
  return hyperConverged;
};
