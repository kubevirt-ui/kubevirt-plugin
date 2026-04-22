import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { DescriptionList, ExpandableSection, Stack, StackItem } from '@patternfly/react-core';

type CloneVMModalHardwareDevicesSectionProps = {
  vm: V1VirtualMachine;
};

const CloneVMModalHardwareDevicesSection: FC<CloneVMModalHardwareDevicesSectionProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const devices = [...(getHostDevices(vm) ?? []), ...(getGPUDevices(vm) ?? [])];

  return (
    <ExpandableSection isIndented toggleText={t('Hardware devices')}>
      {devices.length > 0 ? (
        <DescriptionList columnModifier={{ default: '2Col' }}>
          <DescriptionItem
            descriptionData={
              <Stack>
                {devices.map((device) => (
                  <StackItem key={`${device?.name}-${device?.deviceName}`}>{device.name}</StackItem>
                ))}
              </Stack>
            }
            descriptionHeader={t('Name')}
          />
          <DescriptionItem
            descriptionData={
              <Stack>
                {devices.map((device) => (
                  <StackItem key={`${device?.name}-${device?.deviceName}`}>
                    {device.deviceName}
                  </StackItem>
                ))}
              </Stack>
            }
            descriptionHeader={t('Device name')}
          />
        </DescriptionList>
      ) : (
        <MutedTextSpan text={t('Not available')} />
      )}
    </ExpandableSection>
  );
};

export default CloneVMModalHardwareDevicesSection;
