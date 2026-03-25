import React, { FC } from 'react';

import { Split, SplitItem } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import OperatingSystemTile from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/components/OperatingSystemTileGroup/components/OperatingSystemTile/OperatingSystemTile';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

const OperatingSystemTileGroup: FC = () => {
  const { instanceTypeFlowState, setOperatingSystemType } = useVMWizardStore();
  const { operatingSystemType } = instanceTypeFlowState;

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
