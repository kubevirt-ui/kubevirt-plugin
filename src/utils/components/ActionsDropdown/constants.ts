import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

export type ActionDropdownItemType = Action & {
  accessReview?: FleetAccessReviewResourceAttributes;
  options?: Action[];
};
