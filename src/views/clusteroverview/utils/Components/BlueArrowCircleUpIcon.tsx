import * as React from 'react';

import { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { ArrowCircleUpIcon } from '@patternfly/react-icons';
import { global_default_color_200 as blueDefaultColor } from '@patternfly/react-tokens/dist/js/global_default_color_200';

const BlueArrowCircleUpIcon: React.FC<ColoredIconProps> = ({ className, title }) => (
  <ArrowCircleUpIcon className={className} color={blueDefaultColor.value} title={title} />
);

export default BlueArrowCircleUpIcon;
