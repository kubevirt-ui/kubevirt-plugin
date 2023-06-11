import * as React from 'react';

import { ColoredIconProps } from '@openshift-console/dynamic-plugin-sdk';
import { SyncAltIcon } from '@patternfly/react-icons';
import { global_palette_blue_300 as blueInfoColor } from '@patternfly/react-tokens/dist/js/global_palette_blue_300';

const BlueSyncIcon: React.FC<ColoredIconProps> = ({ className, title }) => (
  <SyncAltIcon className={className} color={blueInfoColor.value} title={title} />
);

export default BlueSyncIcon;
