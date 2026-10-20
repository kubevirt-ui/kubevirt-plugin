import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { type AllowedNamespacesRequestResourceAttributes } from './types';

export const toAllowedNamespacesRequestResourceAttributes = (
  accessReview: FleetAccessReviewResourceAttributes,
): AllowedNamespacesRequestResourceAttributes => ({
  group: accessReview.group,
  resource: accessReview.resource,
  subresource: accessReview.subresource,
  verb: accessReview.verb,
});
