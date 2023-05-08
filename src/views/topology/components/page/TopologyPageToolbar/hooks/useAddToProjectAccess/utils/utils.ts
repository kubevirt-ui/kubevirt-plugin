import { AccessReviewResourceAttributes, K8sKind } from '@openshift-console/dynamic-plugin-sdk';

export const resourceAttributes = (
  model: K8sKind,
  namespace: string,
): AccessReviewResourceAttributes => {
  return {
    group: model.apiGroup || '',
    resource: model.plural,
    namespace,
    verb: 'create',
  };
};
