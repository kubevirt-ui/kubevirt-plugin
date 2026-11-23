import { type FC, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';

import { updateDisksAndBootOrder } from '../../../details/utils/utils';
import { produceUseAsIsoVM, requiresBlankInstallDisk } from './utils/isoCdromVM';

type UseAsISOModalProps = {
  diskName: string;
  getCurrentVM?: () => null | undefined | V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

const UseAsISOModal: FC<UseAsISOModalProps> = ({
  diskName,
  getCurrentVM,
  isOpen,
  onClose,
  onSubmit,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [systemDiskSize, setSystemDiskSize] = useState(DEFAULT_DISK_SIZE);
  const currentVM = getCurrentVM?.() ?? vm;
  const needsBlank = requiresBlankInstallDisk(currentVM, diskName);
  const sizeLabel = t('System disk size');

  const handleSubmit = async (): Promise<V1VirtualMachine> => {
    // Use the same VM snapshot that drove needsBlank / size UI.
    const updatedVM = produceUseAsIsoVM(currentVM, diskName, systemDiskSize);

    if (onSubmit) {
      return onSubmit(updatedVM);
    }

    return updateDisksAndBootOrder(updatedVM);
  };

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Use as an ISO?')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
      submitBtnText={t('Use as ISO')}
      submitBtnVariant={ButtonVariant.primary}
    >
      <Stack data-test="use-as-iso-modal" hasGutter>
        <StackItem>
          {needsBlank
            ? t(
                'The system will use this volume as installation media. A blank system disk is required to install the operating system.',
              )
            : t('The system will use this volume as installation media.')}
        </StackItem>
        {needsBlank && (
          <StackItem data-test="use-as-iso-system-disk-size">
            <CapacityInput
              isRequired={false}
              label={sizeLabel}
              labelHelp={
                <HelpTextIcon
                  bodyContent={t('A blank disk is required for installation.')}
                  headerContent={sizeLabel}
                />
              }
              onChange={setSystemDiskSize}
              size={systemDiskSize}
            />
          </StackItem>
        )}
      </Stack>
    </TabModal>
  );
};

export default UseAsISOModal;
