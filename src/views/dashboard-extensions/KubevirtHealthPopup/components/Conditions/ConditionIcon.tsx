import React, { FC } from 'react';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

type ConditionIconProps = {
  conditionValue: number | string;
};

const ConditionIcon: FC<ConditionIconProps> = ({ conditionValue }) => {
  const valueToIcon = {
    0: <GreenCheckCircleIcon className="kv-health-popup__alerts-count--icon" />,
    1: <YellowExclamationTriangleIcon className="kv-health-popup__alerts-count--icon" />,
    2: <RedExclamationCircleIcon className="kv-health-popup__alerts-count--icon" />,
  };

  return valueToIcon?.[conditionValue];
};

export default ConditionIcon;
