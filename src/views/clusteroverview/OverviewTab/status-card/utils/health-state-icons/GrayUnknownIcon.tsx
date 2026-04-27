import React, { FC } from 'react';

import { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { UnknownIcon } from '@patternfly/react-icons';
import disabledColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_disabled';

const GrayUnknownIcon: FC<ColoredIconProps> = ({ className, title }) => (
  <UnknownIcon className={className} color={disabledColor.var} title={title} />
);

export default GrayUnknownIcon;
