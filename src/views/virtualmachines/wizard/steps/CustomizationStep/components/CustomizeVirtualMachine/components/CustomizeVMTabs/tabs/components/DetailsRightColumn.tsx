import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { BootMode } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import type { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import { DescriptionList, GridItem } from '@patternfly/react-core';
import DetailsSectionBoot from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionBoot';
import DetailsSectionHardware from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionHardware';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

type DetailsRightColumnProps = {
  canUpdateVM: boolean;
  preferredBootmode: BootMode;
};

const DetailsRightColumn: FC<DetailsRightColumnProps> = ({ canUpdateVM, preferredBootmode }) => {
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();
  if (!vm) return null;

  return (
    <GridItem span={5}>
      <DescriptionList>
        <DetailsSectionHardware
          onSubmit={async (_type: HARDWARE_DEVICE_TYPE, updatedVM: V1VirtualMachine) =>
            replaceDraft(updatedVM, vm)
          }
          vm={vm}
        />
        <DetailsSectionBoot
          canUpdateVM={canUpdateVM}
          onUpdateVM={async (updatedVM) => replaceDraft(updatedVM, vm)}
          preferredBootmode={preferredBootmode}
          vm={vm}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default DetailsRightColumn;
