import React, { FCC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

const HardwareDevicesTable: FCC = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;
  const hostDevices = getHostDevices(vm);
  const gpuDevices = getGPUDevices(vm);
  const devices = [...hostDevices, ...gpuDevices];

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
