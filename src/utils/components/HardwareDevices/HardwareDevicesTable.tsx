import * as React from 'react';
import classnames from 'classnames';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import VirtualMachineDescriptionItem from '../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import './hardware-devices-table.scss';

type HardwareDevicesTableProps = {
  devices: V1GPU[] | V1HostDevice[];
};

const HardwareDevicesTable: React.FC<HardwareDevicesTableProps> = ({ devices }) => {
  const { t } = useKubevirtTranslation();

  if (!devices?.length) return <span className="text-muted">{t('Not available')}</span>;

  return (
    <DescriptionList
      className={classnames('pf-c-description-list', 'hardware-devices-table')}
      columnModifier={{ default: '2Col' }}
    >
      <VirtualMachineDescriptionItem
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
      <VirtualMachineDescriptionItem
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
