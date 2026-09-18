import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { BootMode } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import type { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { getDevices } from '@kubevirt-utils/resources/vm';
import { type PatchCustomizeWizardVMSignalArgs } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { DescriptionList, GridItem } from '@patternfly/react-core';
import DetailsSectionBoot from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionBoot';
import DetailsSectionHardware from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionHardware';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

type DetailsRightColumnProps = {
  canUpdateVM: boolean;
  preferredBootmode: BootMode;
};

const DetailsRightColumn: FC<DetailsRightColumnProps> = ({ canUpdateVM, preferredBootmode }) => {
  const { getValues, setValue } = useVMWizard();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });

  const customizeWizardVMPatch = useCallback(
    (patches: PatchCustomizeWizardVMSignalArgs) =>
      patchWizardCustomizedVM(getValues, setValue, patches),
    [getValues, setValue],
  );

  return (
    <GridItem span={5}>
      <DescriptionList>
        <DetailsSectionHardware
          onSubmit={(type: HARDWARE_DEVICE_TYPE, updatedVM: V1VirtualMachine) =>
            Promise.resolve(
              patchWizardCustomizedVM(getValues, setValue, [
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
          customizeWizardVMPatch={customizeWizardVMPatch}
          preferredBootmode={preferredBootmode}
          vm={vm}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default DetailsRightColumn;
