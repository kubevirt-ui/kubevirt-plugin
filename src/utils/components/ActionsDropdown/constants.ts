import type { Action } from '@openshift-console/dynamic-plugin-sdk';
import type { FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

export type ActionDropdownItemType = Action & {
  accessReview?: FleetAccessReviewResourceAttributes;
  options?: Action[];
};
