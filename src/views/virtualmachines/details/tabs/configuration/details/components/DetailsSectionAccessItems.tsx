import { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import PanicDeviceDescriptionItem from '@kubevirt-utils/components/PanicDeviceDescriptionItem/PanicDeviceDescriptionItem';
import VSOCKDetailsDescriptionItem from '@kubevirt-utils/components/VSOCKDetailsDescriptionItem/VSOCKDetailsDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import DetailsSectionCloudIdentity from '@virtualmachines/details/tabs/configuration/details/components/DetailsSectionCloudIdentity/DetailsSectionCloudIdentity';

import { updatePanicDetection, updateVSOCK } from '../utils/utils';
import DeletionProtectionDescriptionItem from './DetailsSectionAccessItems/DeletionProtectionDescriptionItem';
import GuestSystemLogAccessDescriptionItem from './DetailsSectionAccessItems/GuestSystemLogAccessDescriptionItem';
import HeadlessModeDescriptionItem from './DetailsSectionAccessItems/HeadlessModeDescriptionItem';
import HostnameDescriptionItem from './DetailsSectionAccessItems/HostnameDescriptionItem';

type DetailsSectionAccessItemsProps = {
  canUpdateVM: boolean;
  deletionProtectionEnabled: boolean;
  isCheckedGuestSystemAccessLog?: boolean;
  isGuestSystemLogsDisabled: boolean;
  setIsCheckedGuestSystemAccessLog: (checked: boolean) => void;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  vmName: string;
};

const DetailsSectionAccessItems: FC<DetailsSectionAccessItemsProps> = ({
  canUpdateVM,
  deletionProtectionEnabled,
  isCheckedGuestSystemAccessLog,
  isGuestSystemLogsDisabled,
  setIsCheckedGuestSystemAccessLog,
  vm,
  vmi,
  vmName,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <HostnameDescriptionItem canUpdateVM={canUpdateVM} vm={vm} vmi={vmi} vmName={vmName} />
      <DetailsSectionCloudIdentity canUpdateVM={canUpdateVM} vm={vm} vmi={vmi} />
      <HeadlessModeDescriptionItem canUpdateVM={canUpdateVM} vm={vm} vmName={vmName} />
      <VSOCKDetailsDescriptionItem
        disabledTooltipText={t("You don't have permission to update this virtual machine")}
        isDisabled={!canUpdateVM}
        updateVSOCK={(checked) => updateVSOCK(vm, checked)}
        vm={vm}
      />
      <PanicDeviceDescriptionItem
        disabledTooltipText={t("You don't have permission to update this virtual machine")}
        isDisabled={!canUpdateVM}
        updatePanicDetection={(checked, panicDeviceModel) =>
          updatePanicDetection(vm, checked, panicDeviceModel)
        }
        vm={vm}
        vmi={vmi}
      />
      <GuestSystemLogAccessDescriptionItem
        canUpdateVM={canUpdateVM}
        isChecked={isCheckedGuestSystemAccessLog}
        isDisabled={isGuestSystemLogsDisabled}
        setIsChecked={setIsCheckedGuestSystemAccessLog}
        vm={vm}
      />
      <DeletionProtectionDescriptionItem
        canUpdateVM={canUpdateVM}
        isChecked={deletionProtectionEnabled}
        vm={vm}
      />
    </>
  );
};

export default DetailsSectionAccessItems;
