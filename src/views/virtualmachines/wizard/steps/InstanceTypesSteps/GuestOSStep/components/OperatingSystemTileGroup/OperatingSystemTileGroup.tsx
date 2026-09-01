import React, { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { Split, SplitItem } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { resetBootableVolumeFields } from '@virtualmachines/wizard/utils/utils';

import OperatingSystemTile from './components/OperatingSystemTile/OperatingSystemTile';

const OperatingSystemTileGroup: FC = () => {
  const { control, getValues, setValue } = useVMWizard();
  const operatingSystemType: OperatingSystemType = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.OPERATING_SYSTEM_TYPE,
  });
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
            onClick={() => {
              setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.OPERATING_SYSTEM_TYPE, osType);
              setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE, null);
              resetBootableVolumeFields(getValues, setValue);
            }}
            operatingSystem={osType}
          />
        </SplitItem>
      ))}
    </Split>
  );
};

export default OperatingSystemTileGroup;
