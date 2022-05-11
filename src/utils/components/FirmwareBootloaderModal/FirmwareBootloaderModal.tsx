import * as React from 'react';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import {
  getBIOSBootloader,
  getBootloaderLabelFromVM,
  getBootloaderLabels,
  getUEFIBootloader,
  isUEFISecureSelected,
  isUEFISelected,
} from './utils/utils';

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

  const bootloaderLabels = getBootloaderLabels(t);
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] = React.useState<string>(
    getBootloaderLabelFromVM(vm, bootloaderLabels),
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    setSelectedFirmwareBootloader(value);
    setIsDropdownOpen(false);
  };

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      const isUEFIBootloader = isUEFISelected(selectedFirmwareBootloader, bootloaderLabels);
      const isSecureUEFIBootloader = isUEFISecureSelected(
        selectedFirmwareBootloader,
        bootloaderLabels,
      );

      ensurePath(vmDraft, 'spec.template.spec.domain.firmware.bootloader');
      if (!vmDraft.spec.template.spec.domain.firmware.bootloader) {
        vmDraft.spec.template.spec.domain.firmware.bootloader = {};
      }

      if (isSecureUEFIBootloader) {
        ensurePath(vmDraft, 'spec.template.spec.domain.features.smm');
        vmDraft.spec.template.spec.domain.features.smm = {};
      }

      const updatedBootloader = isUEFIBootloader
        ? getUEFIBootloader(isSecureUEFIBootloader)
        : getBIOSBootloader();

      if (
        !isEqualObject(vmDraft.spec.template.spec.domain.firmware.bootloader, updatedBootloader)
      ) {
        vmDraft.spec.template.spec.domain.firmware.bootloader = updatedBootloader;
        if (isSecureUEFIBootloader) {
          vmDraft.spec.template.spec.domain.features.smm.enabled = true;
        }
      }
    });
    console.log(updatedVM?.spec.template.spec.domain);
    return updatedVM;
  }, [vm, selectedFirmwareBootloader, bootloaderLabels]);

  return (
    <TabModal
      onSubmit={onSubmit}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('VirtualMachine boot method')}
      obj={updatedVirtualMachine}
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
            {Object.entries(bootloaderLabels).map(([key, value]) => (
              <SelectOption key={key} value={value}>
                {value}
              </SelectOption>
            ))}
          </Select>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default FirmwareBootloaderModal;
