import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getResourceUrl = (model: K8sModel, resource: K8sResourceCommon): string => {
  if (!model || !resource) return null;

  const ref = `${model.apiGroup || 'core'}~${model.apiVersion}~${model.kind}`;

  const namespace = resource?.metadata?.namespace
    ? `ns/${resource.metadata.namespace}`
    : 'all-namespaces';

  return `/k8s/${namespace}/${ref}/${resource?.metadata?.name}`;
};
