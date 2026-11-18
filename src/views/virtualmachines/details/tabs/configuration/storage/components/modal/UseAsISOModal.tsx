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
      headerText={t('Use as ISO')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      shouldWrapInForm
      submitBtnText={t('Use as ISO')}
      submitBtnVariant={ButtonVariant.primary}
    >
      <Stack hasGutter>
        <StackItem>
          {needsBlank
            ? t(
                'This volume will be used as installation media. A blank system disk is required to install the operating system.',
              )
            : t('This volume will be used as installation media.')}
        </StackItem>
        {needsBlank && (
          <StackItem>
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
