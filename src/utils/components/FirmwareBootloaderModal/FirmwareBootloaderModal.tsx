import * as React from 'react';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { BootloaderLabel, BootloaderOptionValue, bootloaderOptionValues } from './utils/constants';
import { getBootloaderFromVM } from './utils/utils';

type FirmwareBootloaderModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
};

const FirmwareBootloaderModal: React.FC<FirmwareBootloaderModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] =
    React.useState<BootloaderOptionValue>(getBootloaderFromVM(vm));

  const bootloaderOptions: BootloaderLabel[] = [
    {
      value: bootloaderOptionValues.bios,
      title: t('BIOS'),
      description: t('Use BIOS when bootloading the guest OS (Default)'),
    },
    {
      value: bootloaderOptionValues.uefi,
      title: t('UEFI'),
      description: t(
        'Use UEFI when bootloading the guest OS (unsecure). Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
      ),
    },
    {
      value: bootloaderOptionValues.uefiSecure,
      title: t('UEFI (secure)'),
      description: t(
        'Use secure UEFI boot requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
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

      const ensureSMM = () => {
        ensurePath(vmDraft, 'spec.template.spec.domain.features.smm');
        vmDraft.spec.template.spec.domain.features.smm = { enabled: true };
      };

      if (selectedFirmwareBootloader === bootloaderOptionValues.uefiSecure) {
        // uefi requires SSM
        ensureSMM();
        vmDraft.spec.template.spec.domain.firmware.bootloader = {
          efi: { secureBoot: true },
        };
      }

      if (selectedFirmwareBootloader === bootloaderOptionValues.uefi) {
        ensureSMM();
        vmDraft.spec.template.spec.domain.firmware.bootloader = {
          efi: {},
        };
      }
      if (selectedFirmwareBootloader === bootloaderOptionValues.bios) {
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
      headerText={t('VirtualMachine boot method')}
      obj={updatedVirtualMachine}
      submitBtnText={t('Save')}
    >
      <Form>
        <FormGroup fieldId="firmware-bootloader" label={t('Bootloader method')}>
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
