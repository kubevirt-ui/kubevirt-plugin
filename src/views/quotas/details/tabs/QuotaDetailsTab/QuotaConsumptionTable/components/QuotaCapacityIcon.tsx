import React, { FC } from 'react';

import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  OutlinedCircleIcon,
  ResourcesAlmostEmptyIcon,
  ResourcesAlmostFullIcon,
  ResourcesFullIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

type QuotaCapacityIconProps = {
  percent: number;
};

export const QuotaCapacityIcon: FC<QuotaCapacityIconProps> = ({ percent }) => {
  if (percent === 0) {
    return <OutlinedCircleIcon className="co-resource-quota-empty" />;
  }
  if (percent > 0 && percent < 50) {
    return <ResourcesAlmostEmptyIcon className="co-resource-quota-almost-empty" />;
  }
  if (percent >= 50 && percent < 100) {
    return <ResourcesAlmostFullIcon className="co-resource-quota-almost-full" />;
  }
  if (percent === 100) {
    return <ResourcesFullIcon className="co-resource-quota-full" />;
  }
  if (percent > 100) {
    return <YellowExclamationTriangleIcon className="co-resource-quota-exceeded" />;
  }
  return <UnknownIcon />;
};
