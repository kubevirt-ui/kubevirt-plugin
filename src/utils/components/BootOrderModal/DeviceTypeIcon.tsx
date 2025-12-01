import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DeviceType } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { NetworkIcon, VolumeIcon } from '@patternfly/react-icons';

type DeviceTypeIconProps = {
  type: DeviceType;
};

const DeviceTypeIcon: React.FC<DeviceTypeIconProps> = ({ type }) => {
  const { t } = useKubevirtTranslation();

  if (type === DeviceType.NIC) {
    return (
      <Tooltip content={t('This is a network interface (NIC)')} position={TooltipPosition.bottom}>
        <NetworkIcon />
      </Tooltip>
    );
  }

  return <VolumeIcon />;
};

export default DeviceTypeIcon;
