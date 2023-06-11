import React from 'react';

import { DeviceType } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';
import { NetworkIcon, VolumeIcon } from '@patternfly/react-icons';

type DeviceTypeIconProps = {
  type: DeviceType;
};

const DeviceTypeIconMapping = {
  DISK: VolumeIcon,
  NIC: NetworkIcon,
} as const;

const DeviceTypeIcon: React.FC<DeviceTypeIconProps> = ({ type }) => {
  const Icon = DeviceTypeIconMapping[type];

  return Icon ? <Icon /> : <VolumeIcon />;
};

export default DeviceTypeIcon;
