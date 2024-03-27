import React, { FC } from 'react';

import { ColoredIconProps, StatusIconAndText } from '@openshift-console/dynamic-plugin-sdk';

import { iconMapper } from '../../utils/consts';

type SnapshotStatusIconProps = {
  phase: string;
};

const SnapshotStatusIcon: FC<SnapshotStatusIconProps> = ({ phase }) => {
  const StatusIcon: FC<ColoredIconProps> = iconMapper?.[phase] || iconMapper.default;

  return <StatusIconAndText icon={<StatusIcon />} title={phase} />;
};

export default SnapshotStatusIcon;
