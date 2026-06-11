import React, { FC } from 'react';

import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { Split, SplitItem } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard-new/state/instance-type-vm-store/useInstanceTypeVMStore';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

import OperatingSystemTile from './components/OperatingSystemTile/OperatingSystemTile';

const OperatingSystemTileGroup: FC = () => {
  const { operatingSystemType, setOperatingSystemType } = useInstanceTypeVMStore();
  const isWindowsSupported = useIsWindowsSupportedArchitecture();

  const osTypes = [
    OperatingSystemType.RHEL,
    ...(isWindowsSupported ? [OperatingSystemType.WINDOWS] : []),
    OperatingSystemType.OTHER_LINUX,
  ];

  return (
    <Split hasGutter>
      {osTypes.map((osType) => (
        <SplitItem key={osType}>
          <OperatingSystemTile
            isSelected={operatingSystemType === osType}
            onClick={() => setOperatingSystemType(osType)}
            operatingSystem={osType}
          />
        </SplitItem>
      ))}
    </Split>
  );
};

export default OperatingSystemTileGroup;
