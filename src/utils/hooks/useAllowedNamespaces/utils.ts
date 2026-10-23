import { HTTP_METHODS } from '@kubevirt-utils/constants/constants';
import {
  PROXY_ALLOWED_NAMESPACES_PATH,
  PROXY_KUBEVIRT_URL,
} from '@kubevirt-utils/hooks/useKubevirtDataPod/utils/constants';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

export const getAllowedNamespacesURL = (): string =>
  `${PROXY_KUBEVIRT_URL}${PROXY_ALLOWED_NAMESPACES_PATH}`;

export const buildAllowedNamespacesFetchRequest = (
  accessReview: FleetAccessReviewResourceAttributes,
): RequestInit => ({
  body: JSON.stringify({
    resourceAttributes: {
      group: accessReview.group,
      resource: accessReview.resource,
      subresource: accessReview.subresource,
      verb: accessReview.verb,
    },
  }),
  headers: {
    'Content-Type': 'application/json',
  },
  method: HTTP_METHODS.POST,
});
