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
    <DescriptionList columnModifier={{ default: '2Col' }} className="hardware-devices-table">
      <DescriptionListGroup>
        <DescriptionListTerm>{t('Resource Name')}</DescriptionListTerm>
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
            {devices.map((device) => (
              <StackItem key={device.deviceName}>{device.deviceName}</StackItem>
            ))}
          </Stack>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default HardwareDevicesTable;
