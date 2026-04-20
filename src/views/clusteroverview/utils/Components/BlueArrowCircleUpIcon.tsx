import React, { FCC } from 'react';

import { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { ArrowCircleUpIcon } from '@patternfly/react-icons';
import blueDefaultColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_brand_default';

const BlueArrowCircleUpIcon: FCC<ColoredIconProps> = ({ className, title }) => (
  <ArrowCircleUpIcon className={className} color={blueDefaultColor.var} title={title} />
);

export default BlueArrowCircleUpIcon;
