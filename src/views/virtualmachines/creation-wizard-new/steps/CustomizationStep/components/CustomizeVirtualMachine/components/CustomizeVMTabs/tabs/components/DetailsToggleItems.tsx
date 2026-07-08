import React, { Dispatch, FC, SetStateAction } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import EnableVSOCK from '@kubevirt-utils/components/EnableVSOCK/EnableVSOCK';
import HeadlessMode from '@kubevirt-utils/components/HeadlessMode/HeadlessMode';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  patchCustomizeWizardVMSignal,
  vmSignal,
} from '@kubevirt-utils/store/customizeInstanceType';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Switch } from '@patternfly/react-core';
import DeletionProtectionModal from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/DeletionProtectionModal';
import { VM_DELETION_PROTECTION_LABEL } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/constants';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';

type DetailsToggleItemsProps = {
  deletionProtectionEnabled: boolean;
  isCheckedGuestSystemAccessLog: boolean;
  isGuestSystemLogsDisabled: boolean;
  setIsCheckedGuestSystemAccessLog: Dispatch<SetStateAction<boolean>>;
};

const DetailsToggleItems: FC<DetailsToggleItemsProps> = ({
  deletionProtectionEnabled,
  isCheckedGuestSystemAccessLog,
  isGuestSystemLogsDisabled,
  setIsCheckedGuestSystemAccessLog,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vm = vmSignal.value;
  const vmName = getName(vm);

  return (
    <>
      <DescriptionItem
        bodyContent={t(
          'Whether to attach the default graphics device or not. VNC will not be available if checked.',
        )}
        descriptionData={
          <HeadlessMode
            updateHeadlessMode={(checked) =>
              Promise.resolve(
                patchCustomizeWizardVMSignal([
                  {
                    data: checked ? false : null,
                    path: `spec.template.spec.domain.devices.autoattachGraphicsDevice`,
                  },
                ]),
              )
            }
            vm={vm}
          />
        }
        breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
        data-test-id={`${vmName}-headless`}
        descriptionHeader={<SearchItem id="headless-mode">{t('Headless mode')}</SearchItem>}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.HEADLESS_MODE}
      />
      <DescriptionItem
        bodyContent={t(
          'Attaches a virtio-vsock device for direct communication between the guest and the host without a network interface.',
        )}
        descriptionData={
          <EnableVSOCK
            updateVSOCK={(checked) =>
              Promise.resolve(
                updateCustomizeInstanceType([
                  {
                    data: checked,
                    path: `spec.template.spec.domain.devices.autoattachVSOCK`,
                  },
                ]),
              )
            }
            vm={vm}
          />
        }
        breadcrumb="VirtualMachine.spec.template.devices.autoattachVSOCK"
        data-test-id={`${vmName}-enable-vsock`}
        descriptionHeader={<SearchItem id="enable-vsock">{t('Enable VSOCK')}</SearchItem>}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.ENABLE_VSOCK}
      />
      <DescriptionItem
        bodyContent={t(
          "Enables access to the VirtualMachine's guest system log. Wait a few seconds for logging to start before viewing the log.",
        )}
        descriptionData={
          <Switch
            onChange={(_event, checked) => {
              setIsCheckedGuestSystemAccessLog(checked);
              patchCustomizeWizardVMSignal([
                { data: checked, path: `spec.template.spec.domain.devices.logSerialConsole` },
              ]);
            }}
            id="guest-system-log-access"
            isChecked={isCheckedGuestSystemAccessLog}
            isDisabled={isGuestSystemLogsDisabled}
          />
        }
        descriptionHeader={
          <SearchItem id="guest-system-log-access">{t('Guest system log access')}</SearchItem>
        }
        data-test-id="guest-system-log-access"
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.GUEST_SYSTEM_LOG_ACCESS}
      />
      <DescriptionItem
        bodyContent={t(
          'Applying deletion protection to this VM will prevent deletion through the web console.',
        )}
        descriptionData={
          <Switch
            onChange={(_event, checked) =>
              createModal(({ isOpen, onClose }) => (
                <DeletionProtectionModal
                  deletionProtectionOption={
                    checked
                      ? VMDeletionProtectionOptions.ENABLE
                      : VMDeletionProtectionOptions.DISABLE
                  }
                  onConfirm={(enableDeletionProtection) => {
                    patchCustomizeWizardVMSignal([
                      {
                        data: enableDeletionProtection ? 'true' : 'false',
                        path: ['metadata', 'labels', VM_DELETION_PROTECTION_LABEL],
                      },
                    ]);
                    onClose();
                  }}
                  isOpen={isOpen}
                  onCancel={onClose}
                  vm={vm}
                />
              ))
            }
            id="deletion-protection"
            isChecked={deletionProtectionEnabled}
          />
        }
        descriptionHeader={
          <SearchItem id="deletion-protection">{t('Deletion protection')}</SearchItem>
        }
        data-test-id="deletion-protection"
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.DELETION_PROTECTION}
      />
    </>
  );
};

export default DetailsToggleItems;
