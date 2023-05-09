import React, { ChangeEvent, FC, useMemo, useState } from 'react';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { bootloaderOptions } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import { BootloaderOptionValue } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/types';
import {
  getBootloaderFromVM,
  updatedVMBootMode,
} from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
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

const TemplateBootloaderModal: FC<TemplateBootloaderModalProps> = ({
  template,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] =
    useState<BootloaderOptionValue>(getBootloaderFromVM(getTemplateVirtualMachineObject(template)));

  const handleChange = (event: ChangeEvent<HTMLSelectElement>, value: BootloaderOptionValue) => {
    event.preventDefault();
    setSelectedFirmwareBootloader(value);
    setIsDropdownOpen(false);
  };

  const updatedTemplate = useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      const vmDraft = getTemplateVirtualMachineObject(templateDraft);
      const updatedVM = updatedVMBootMode(vmDraft, selectedFirmwareBootloader);

      vmDraft.spec.template.spec.domain = updatedVM.spec.template.spec.domain;
    });
  }, [selectedFirmwareBootloader, template]);

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
