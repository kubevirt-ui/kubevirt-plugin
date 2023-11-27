import * as React from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './hardware-devices-table.scss';

type HardwareDevicesTableProps = {
  devices: V1GPU[] | V1HostDevice[];
};

const HardwareDevicesTable: React.FC<HardwareDevicesTableProps> = ({ devices }) => {
  const { t } = useKubevirtTranslation();

  if (!devices?.length) return <span className="text-muted">{t('Not available')}</span>;

  return (
    <DescriptionList className="hardware-devices-table" columnModifier={{ default: '2Col' }}>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Resource name')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {devices.map((device) => (
              <StackItem key={device.name}>{device.name}</StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Hardware device name')}</DescriptionListTerm>
        <DescriptionListDescription>
          <Stack>
            {devices.map((device: { deviceName: string; index: number; name: string }) => (
              <StackItem key={`${device?.name}-${device?.deviceName}`}>
                {device.deviceName}
              </StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default HardwareDevicesTable;
