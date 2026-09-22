import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '../state/vm-wizard-form/consts';

const HardwareDevicesTable: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });
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
