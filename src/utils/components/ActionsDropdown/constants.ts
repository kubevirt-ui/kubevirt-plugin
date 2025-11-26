import { ReactNode } from 'react';

import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

export type ActionDropdownItemType = Omit<Action, 'description'> & {
  accessReview?: FleetAccessReviewResourceAttributes;
  description?: ReactNode | string;
  options?: ActionDropdownItemType[];
};
