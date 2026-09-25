import type { Dispatch, FC, SetStateAction } from 'react';
import produce from 'immer';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import HeadlessMode from '@kubevirt-utils/components/HeadlessMode/HeadlessMode';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Switch } from '@patternfly/react-core';
import DeletionProtectionModal from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/DeletionProtectionModal';
import { VM_DELETION_PROTECTION_LABEL } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/constants';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

type DetailsToggleItemsProps = {
  deletionProtectionEnabled: boolean;
  isCheckedGuestSystemAccessLog: boolean;
  isGuestSystemLogsDisabled: boolean;
  setIsCheckedGuestSystemAccessLog: Dispatch<SetStateAction<boolean>>;
};

const withDeletionProtection = (vm: V1VirtualMachine, enabled: boolean): V1VirtualMachine =>
  produce(vm, (draft) => {
    ensurePath(draft, ['metadata.labels']);

    draft.metadata.labels[VM_DELETION_PROTECTION_LABEL] = enabled ? 'true' : 'false';
  });

const DetailsToggleItems: FC<DetailsToggleItemsProps> = ({
  deletionProtectionEnabled,
  isCheckedGuestSystemAccessLog,
  isGuestSystemLogsDisabled,
  setIsCheckedGuestSystemAccessLog,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();
  const vmName = getName(vm);

  if (!vm) return null;

  return (
    <>
      <DescriptionItem
        bodyContent={t(
          'Whether to attach the default graphics device or not. VNC will not be available if checked.',
        )}
        breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
        data-test={`${vmName}-headless`}
        descriptionData={
          <HeadlessMode
            updateHeadlessMode={(checked) => {
              return Promise.resolve(
                replaceDraft(
                  produce(vm, (draft) => {
                    ensurePath(draft, 'spec.template.spec.domain.devices');
                    draft.spec.template.spec.domain.devices.autoattachGraphicsDevice = checked
                      ? false
                      : null;
                  }),
                  vm,
                ),
              );
            }}
            vm={vm}
          />
        }
        descriptionHeader={<SearchItem id="headless-mode">{t('Headless mode')}</SearchItem>}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.HEADLESS_MODE}
      />
      <DescriptionItem
        bodyContent={t(
          "Enables access to the VirtualMachine's guest system log. Wait a few seconds for logging to start before viewing the log.",
        )}
        descriptionData={
          <Switch
            id="guest-system-log-access"
            isChecked={isCheckedGuestSystemAccessLog}
            isDisabled={isGuestSystemLogsDisabled}
            onChange={(_event, checked) => {
              setIsCheckedGuestSystemAccessLog(checked);
              replaceDraft(
                produce(vm, (draft) => {
                  ensurePath(draft, 'spec.template.spec.domain.devices');
                  draft.spec.template.spec.domain.devices.logSerialConsole = checked;
                }),
                vm,
              );
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
                    replaceDraft(withDeletionProtection(vm, Boolean(enableDeletionProtection)), vm);
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

export default DetailsToggleItems;
