import React, { FC, MouseEvent, useMemo, useState } from 'react';
import produce from 'immer';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { bootloaderOptions } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import { BootloaderOptionValue } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/types';
import {
  getBootloaderFromVM,
  updatedVMBootMode,
} from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { Form, FormGroup, SelectOption } from '@patternfly/react-core';

type TemplateBootloaderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const TemplateBootloaderModal: FC<TemplateBootloaderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] =
    useState<BootloaderOptionValue>(getBootloaderFromVM(getTemplateVirtualMachineObject(template)));

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: BootloaderOptionValue) => {
    event.preventDefault();
    setSelectedFirmwareBootloader(value);
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
      headerText={t('Boot mode')}
      isOpen={isOpen}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup fieldId="template-firmware-bootloader" label={t('Boot mode')}>
          <FormPFSelect onSelect={handleChange} selected={selectedFirmwareBootloader}>
            {bootloaderOptions.map(({ description, title, value }) => (
              <SelectOption description={description} key={value} value={value}>
                {title}
              </SelectOption>
            ))}
          </FormPFSelect>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default TemplateBootloaderModal;
