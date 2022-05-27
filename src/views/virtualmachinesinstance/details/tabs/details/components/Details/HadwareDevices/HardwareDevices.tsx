import * as React from 'react';

import { V1Devices } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HardwareDevicesTable from '@kubevirt-utils/components/HardwareDevices/HardwareDevicesTable';
import HardwareDeviceTitle from '@kubevirt-utils/components/HardwareDevices/HardwareDeviceTitle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
} from '@patternfly/react-core';

type HardwareDevices = {
  devices: V1Devices;
};

const HardwareDevices: React.FC<HardwareDevices> = ({ devices }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionList>
      <DescriptionListGroup>
        <HardwareDeviceTitle title={t('GPU devices')} canEdit={false} />
        <DescriptionListDescription>
          <HardwareDevicesTable devices={devices?.gpus} />
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <HardwareDeviceTitle title={t('Host devices')} canEdit={false} />
        <DescriptionListDescription>
          <HardwareDevicesTable devices={devices?.hostDevices} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default HardwareDevices;
