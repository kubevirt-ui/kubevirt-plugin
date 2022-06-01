import * as React from 'react';

import { ColoredIconProps, StatusIconAndText } from '@openshift-console/dynamic-plugin-sdk';

import { iconMapper } from '../../utils/consts';

type SnapshotStatusIconProps = {
  phase: string;
};

const SnapshotStatusIcon: React.FC<SnapshotStatusIconProps> = ({ phase }) => {
  const StatusIcon: React.FC<ColoredIconProps> = iconMapper[phase];

  return (
    <>
      <StatusIconAndText icon={<StatusIcon />} title={phase} />
    </>
  );
};

export default SnapshotStatusIcon;
