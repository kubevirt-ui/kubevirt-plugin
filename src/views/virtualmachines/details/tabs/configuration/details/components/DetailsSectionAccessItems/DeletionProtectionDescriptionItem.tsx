import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Switch } from '@patternfly/react-core';
import DeletionProtectionModal from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/DeletionProtectionModal';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';
import { setDeletionProtectionForVM } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

type DeletionProtectionDescriptionItemProps = {
  canUpdateVM: boolean;
  isChecked: boolean;
  vm: V1VirtualMachine;
};

const DeletionProtectionDescriptionItem: FC<DeletionProtectionDescriptionItemProps> = ({
  canUpdateVM,
  isChecked,
  vm,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem
      bodyContent={t(
        'Applying deletion protection to this VM will prevent deletion through the web console.',
      )}
      descriptionData={
        <Switch
          id="deletion-protection"
          isChecked={isChecked}
          isDisabled={!canUpdateVM}
          onChange={(_event, checked) =>
            createModal(({ isOpen, onClose }) => (
              <DeletionProtectionModal
                deletionProtectionOption={
                  checked ? VMDeletionProtectionOptions.ENABLE : VMDeletionProtectionOptions.DISABLE
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
  );
};

export default DeletionProtectionDescriptionItem;
