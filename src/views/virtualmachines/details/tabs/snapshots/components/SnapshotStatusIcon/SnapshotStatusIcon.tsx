import React, { FCC } from 'react';

import { ColoredIconProps, StatusIconAndText } from '@openshift-console/dynamic-plugin-sdk';

import { iconMapper } from '../../utils/consts';

type SnapshotStatusIconProps = {
  phase: string;
};

const SnapshotStatusIcon: FCC<SnapshotStatusIconProps> = ({ phase }) => {
  const StatusIcon: FCC<ColoredIconProps> = iconMapper?.[phase] || iconMapper.default;

  return <StatusIconAndText icon={<StatusIcon />} title={phase} />;
};

export default SnapshotStatusIcon;
