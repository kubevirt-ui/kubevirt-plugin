import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BootMode } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { getDevices } from '@kubevirt-utils/resources/vm';
import {
  patchCustomizeWizardVMSignal,
  vmSignal,
} from '@kubevirt-utils/store/customizeInstanceType';
import { DescriptionList, GridItem } from '@patternfly/react-core';
import DetailsSectionBoot from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionBoot';
import DetailsSectionHardware from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionHardware';

type DetailsRightColumnProps = {
  canUpdateVM: boolean;
  preferredBootmode: BootMode;
};

const DetailsRightColumn: FC<DetailsRightColumnProps> = ({ canUpdateVM, preferredBootmode }) => {
  const vm = vmSignal.value;
  return (
    <GridItem span={5}>
      <DescriptionList>
        <DetailsSectionHardware
          onSubmit={(type: HARDWARE_DEVICE_TYPE, updatedVM: V1VirtualMachine) =>
            Promise.resolve(
              patchCustomizeWizardVMSignal([
                {
                  data: getDevices(updatedVM)?.[type],
                  path: `spec.template.spec.domain.devices.${type}`,
                },
              ]),
            )
          }
          vm={vm}
        />
        <DetailsSectionBoot
          canUpdateVM={canUpdateVM}
          isCustomizeInstanceType
          preferredBootmode={preferredBootmode}
          vm={vm}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default DetailsRightColumn;
