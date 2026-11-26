import type { FC } from 'react';

import type { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import blueInfoColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_brand_default';

const BlueOutlinedQuestionCircleIcon: FC<ColoredIconProps> = ({ className, title }) => (
  <OutlinedQuestionCircleIcon className={className} color={blueInfoColor.var} title={title} />
);

export default BlueOutlinedQuestionCircleIcon;
