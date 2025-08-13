import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HardwareDevicesTable from '@kubevirt-utils/components/HardwareDevices/HardwareDevicesTable';
import HardwareDeviceTitle from '@kubevirt-utils/components/HardwareDevices/HardwareDeviceTitle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { hasS390xArchitecture } from '@kubevirt-utils/resources/vmi/utils/architecture';
import { getVMIDevices } from '@kubevirt-utils/resources/vmi/utils/selectors';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
} from '@patternfly/react-core';

type HardwareDevicesProps = {
  vmi: V1VirtualMachineInstance;
};

const HardwareDevices: React.FC<HardwareDevicesProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const devices = getVMIDevices(vmi);
  const vmiHasS390xArchitecture = hasS390xArchitecture(vmi);

  return (
    <DescriptionList>
      {!vmiHasS390xArchitecture && (
        <DescriptionListGroup>
          <HardwareDeviceTitle canEdit={false} title={t('GPU devices')} />
          <DescriptionListDescription>
            <HardwareDevicesTable devices={devices?.gpus} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}

      <DescriptionListGroup>
        <HardwareDeviceTitle canEdit={false} title={t('Host devices')} />
        <DescriptionListDescription>
          <HardwareDevicesTable devices={devices?.hostDevices} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

export default HardwareDevices;
