import * as React from 'react';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import DescriptionItem from '../DescriptionItem/DescriptionItem';

import './hardware-devices-table.scss';

type HardwareDevicesTableProps = {
  devices: V1GPU[] | V1HostDevice[];
};

const HardwareDevicesTable: React.FC<HardwareDevicesTableProps> = ({ devices }) => {
  const { t } = useKubevirtTranslation();

  if (!devices?.length)
    return <span className="pf-v6-u-text-color-subtle">{t('Not available')}</span>;

  return (
    <DescriptionList className="hardware-devices-table" columnModifier={{ default: '2Col' }}>
      <DescriptionItem
        descriptionData={
          <Stack>
            {devices.map((device: { deviceName: string; index: number; name: string }) => (
              <StackItem key={`${device?.name}-${device?.deviceName}`}>
                {device.deviceName}
              </StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Name')}
      />
      <DescriptionItem
        descriptionData={
          <Stack>
            {devices.map((device) => (
              <StackItem key={device.name}>{device.name}</StackItem>
            ))}
          </Stack>
        }
        descriptionHeader={t('Device name')}
      />
    </DescriptionList>
  );
};

export default HardwareDevicesTable;
