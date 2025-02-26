import * as React from 'react';

import { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { SyncAltIcon } from '@patternfly/react-icons';
import blueInfoColor from '@patternfly/react-tokens/dist/js/t_global_icon_color_brand_default';

const BlueSyncIcon: React.FC<ColoredIconProps> = ({ className, title }) => (
  <SyncAltIcon className={className} color={blueInfoColor.value} title={title} />
);

export default BlueSyncIcon;
