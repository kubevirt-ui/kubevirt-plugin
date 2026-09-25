import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { Split, SplitItem } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { resetBootableVolumeFields } from '@virtualmachines/wizard/utils/utils';

import OperatingSystemTile from './components/OperatingSystemTile/OperatingSystemTile';

const OperatingSystemTileGroup: FC = () => {
  const { control, setValue } = useVMWizardForm();
  const operatingSystemType: OperatingSystemType = useWatch({
    control,
    name: 'instanceType.operatingSystem',
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
              setValue('instanceType.operatingSystem', osType, { shouldValidate: true });
              resetBootableVolumeFields(setValue);
            }}
            operatingSystem={osType}
          />
        </SplitItem>
      ))}
    </Split>
  );
};

export default OperatingSystemTileGroup;
