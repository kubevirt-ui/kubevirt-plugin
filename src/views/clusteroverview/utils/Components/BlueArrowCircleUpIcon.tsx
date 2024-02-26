import React, { FC } from 'react';

import { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { ArrowCircleUpIcon } from '@patternfly/react-icons';
import { global_Color_200 as blueDefaultColor } from '@patternfly/react-tokens';
const BlueArrowCircleUpIcon: FC<ColoredIconProps> = ({ className, title }) => (
  <ArrowCircleUpIcon className={className} color={blueDefaultColor.value} title={title} />
);

export default BlueArrowCircleUpIcon;
