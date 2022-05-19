import * as React from 'react';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  BootloaderLabel,
  BootloaderOptionValue,
} from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import { getBootloaderFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { Form, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

type TemplateBootloaderModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1Template) => Promise<V1Template | void>;
};

const TemplateBootloaderModal: React.FC<TemplateBootloaderModalProps> = ({
  template,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] =
    React.useState<BootloaderOptionValue>(
      getBootloaderFromVM(getTemplateVirtualMachineObject(template)),
    );

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

  const updatedTemplate = React.useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      const vmDraft = getTemplateVirtualMachineObject(templateDraft);
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
  }, [template, selectedFirmwareBootloader]);

  return (
    <TabModal
      onSubmit={onSubmit}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Boot mode')}
      obj={updatedTemplate}
    >
      <Form>
        <FormGroup fieldId="template-firmware-bootloader" label={t('Boot mode')}>
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

export default TemplateBootloaderModal;
