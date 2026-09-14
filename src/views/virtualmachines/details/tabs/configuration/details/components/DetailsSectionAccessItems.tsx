import React, { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import HeadlessMode from '@kubevirt-utils/components/HeadlessMode/HeadlessMode';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Switch } from '@patternfly/react-core';
import DeletionProtectionModal from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/DeletionProtectionModal';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';
import { setDeletionProtectionForVM } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

import { updatedHostname, updateGuestSystemAccessLog, updateHeadlessMode } from '../utils/utils';

type DetailsSectionAccessItemsProps = {
  deletionProtectionEnabled: boolean;
  isCheckedGuestSystemAccessLog?: boolean;
  isGuestSystemLogsDisabled: boolean;
  setIsCheckedGuestSystemAccessLog: (checked: boolean) => void;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  vmName: string;
};

const DetailsSectionAccessItems: FC<DetailsSectionAccessItemsProps> = ({
  deletionProtectionEnabled,
  isCheckedGuestSystemAccessLog,
  isGuestSystemLogsDisabled,
  setIsCheckedGuestSystemAccessLog,
  vm,
  vmi,
  vmName,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  return (
    <>
      <DescriptionItem
        data-test={`${vmName}-hostname`}
        descriptionData={vm?.spec?.template?.spec?.hostname ?? vmName}
        descriptionHeader={<SearchItem id="hostname">{t('Hostname')}</SearchItem>}
        isEdit
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <HostnameModal
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={updatedHostname}
              vm={vm}
              vmi={vmi}
            />
          ))
        }
      />
      <DescriptionItem
        bodyContent={t(
          'Whether to attach the default graphics device or not. VNC will not be available if checked.',
        )}
        breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
        data-test={`${vmName}-headless`}
        descriptionData={
          <HeadlessMode updateHeadlessMode={(checked) => updateHeadlessMode(vm, checked)} vm={vm} />
        }
        descriptionHeader={<SearchItem id="headless-mode">{t('Headless mode')}</SearchItem>}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.HEADLESS_MODE}
      />
      <DescriptionItem
        bodyContent={t(
          'Applying the start/pause mode to this virtual machine will cause it to partially reboot and pause.',
        )}
        descriptionData={
          <Switch
            id="guest-system-log-access"
            isChecked={isCheckedGuestSystemAccessLog}
            isDisabled={isGuestSystemLogsDisabled}
            onChange={(_event, checked) => {
              setIsCheckedGuestSystemAccessLog(checked);
              void updateGuestSystemAccessLog(vm, checked);
            }}
          />
        }
        descriptionHeader={
          <SearchItem id="guest-system-log-access">{t('Guest system log access')}</SearchItem>
        }
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
            id="deletion-protection"
            isChecked={deletionProtectionEnabled}
            onChange={(_event, checked) =>
              createModal(({ isOpen, onClose }) => (
                <DeletionProtectionModal
                  deletionProtectionOption={
                    checked
                      ? VMDeletionProtectionOptions.ENABLE
                      : VMDeletionProtectionOptions.DISABLE
                  }
                  isOpen={isOpen}
                  onCancel={onClose}
                  onConfirm={(enableDeletionProtection) => {
                    void setDeletionProtectionForVM(vm, enableDeletionProtection);
                    onClose();
                  }}
                  vm={vm}
                />
              ))
            }
          />
        }
        descriptionHeader={
          <SearchItem id="deletion-protection">{t('Deletion protection')}</SearchItem>
        }
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.DELETION_PROTECTION}
      />
    </>
  );
};

export default DetailsSectionAccessItems;
