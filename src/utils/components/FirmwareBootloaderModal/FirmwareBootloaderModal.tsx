import * as React from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Form, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { checkBootModeChanged } from '../PendingChanges/utils/helpers';

import { BootloaderLabel, BootloaderOptionValue } from './utils/constants';
import { getBootloaderFromVM } from './utils/utils';

type FirmwareBootloaderModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
};

const FirmwareBootloaderModal: React.FC<FirmwareBootloaderModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSubmit,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] =
    React.useState<BootloaderOptionValue>(getBootloaderFromVM(vm));

  const bootloaderOptions: BootloaderLabel[] = [
    {
      value: 'bios',
      title: t('BIOS'),
      description: t('Use BIOS when bootloading the guest OS (Default)'),
    },
    {
      value: 'uefi',
      title: t('UEFI'),
      description: t(
        'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
      ),
    },
    {
      value: 'uefiSecure',
      title: t('UEFI (secure)'),
      description: t(
        'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
      ),
    },
  ];

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    value: BootloaderOptionValue,
  ) => {
    event.preventDefault();
    setSelectedFirmwareBootloader(value);
    setIsDropdownOpen(false);
  };

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, 'spec.template.spec.domain.firmware.bootloader');

      ensurePath(vmDraft, 'spec.template.spec.domain.features.smm');
      vmDraft.spec.template.spec.domain.features.smm = { enabled: true };

      switch (selectedFirmwareBootloader) {
        case 'uefi':
          vmDraft.spec.template.spec.domain.firmware.bootloader = {
            efi: {},
          };
          break;
        case 'uefiSecure':
          vmDraft.spec.template.spec.domain.firmware.bootloader = {
            efi: { secureBoot: true },
          };
          break;
        default: // 'bios'
          vmDraft.spec.template.spec.domain.firmware.bootloader = { bios: {} };
      }
    });
    return updatedVM;
  }, [vm, selectedFirmwareBootloader]);

  return (
    <TabModal
      onSubmit={onSubmit}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Boot mode')}
      obj={updatedVirtualMachine}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert isChanged={checkBootModeChanged(updatedVirtualMachine, vmi)} />
        )}
        <FormGroup fieldId="firmware-bootloader" label={t('Boot mode')}>
          <Select
            menuAppendTo="parent"
            isOpen={isDropdownOpen}
            onToggle={setIsDropdownOpen}
            onSelect={handleChange}
            variant={SelectVariant.single}
            selections={selectedFirmwareBootloader}
          >
            {bootloaderOptions.map(({ value, title, description }) => (
              <SelectOption key={value} value={value} description={description}>
                {title}
              </SelectOption>
            ))}
          </Select>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default FirmwareBootloaderModal;
