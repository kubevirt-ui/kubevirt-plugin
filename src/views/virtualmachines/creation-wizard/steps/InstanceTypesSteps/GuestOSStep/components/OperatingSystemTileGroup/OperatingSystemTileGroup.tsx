import React, { FCC } from 'react';

import { Split, SplitItem } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

import OperatingSystemTile from './components/OperatingSystemTile/OperatingSystemTile';

const OperatingSystemTileGroup: FCC = () => {
  const { operatingSystemType, setOperatingSystemType } = useInstanceTypeVMStore();

  return (
    <Split hasGutter>
      {[OperatingSystemType.RHEL, OperatingSystemType.WINDOWS, OperatingSystemType.OTHER_LINUX].map(
        (osType) => (
          <SplitItem key={osType}>
            <OperatingSystemTile
              isSelected={operatingSystemType === osType}
              onClick={() => setOperatingSystemType(osType)}
              operatingSystem={osType}
            />
          </SplitItem>
        ),
      )}
    </Split>
  );
};

export default OperatingSystemTileGroup;
