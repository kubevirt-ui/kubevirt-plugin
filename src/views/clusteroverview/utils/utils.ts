import { modelToRef } from '@kubevirt-ui/kubevirt-api/console';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const buildUrlForCSVSubscription = (model: K8sModel, name?: string, namespace?: string) => {
  const url = ['/k8s'];
  url.push(namespace ? `/ns/${namespace}/` : '/all-namespaces/');
  url.push(modelToRef(model));
  url.push(`/${encodeURIComponent(name)}`);
  url.push('/subscription');

  return url.join('');
};
