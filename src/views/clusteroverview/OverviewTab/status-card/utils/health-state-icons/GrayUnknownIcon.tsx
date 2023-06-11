import * as React from 'react';

import { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { UnknownIcon } from '@patternfly/react-icons';
import { global_disabled_color_100 as disabledColor } from '@patternfly/react-tokens/dist/js/global_disabled_color_100';

const GrayUnknownIcon: React.FC<ColoredIconProps> = ({ className, title }) => (
  <UnknownIcon className={className} color={disabledColor.value} title={title} />
);

export default GrayUnknownIcon;
