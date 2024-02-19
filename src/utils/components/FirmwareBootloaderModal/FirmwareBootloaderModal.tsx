import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, SelectList, SelectOption } from '@patternfly/react-core';

import FormPFSelect from '../FormPFSelect/FormPFSelect';

import { bootloaderOptions, BootModeTitles } from './utils/constants';
import { BootloaderOptionValue } from './utils/types';
import { getBootloaderFromVM, updatedVMBootMode } from './utils/utils';

type FirmwareBootloaderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const FirmwareBootloaderModal: FC<FirmwareBootloaderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] =
    useState<BootloaderOptionValue>(getBootloaderFromVM(vm));

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: BootloaderOptionValue) => {
    event.preventDefault();
    setSelectedFirmwareBootloader(value);
  };

  const updatedVirtualMachine = useMemo(
    () => updatedVMBootMode(vm, selectedFirmwareBootloader),
    [vm, selectedFirmwareBootloader],
  );

  return (
    <TabModal
      headerText={t('Boot mode')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && <ModalPendingChangesAlert />}
        <FormGroup fieldId="firmware-bootloader" label={t('Boot mode')}>
          <FormPFSelect
            onSelect={handleChange}
            selected={selectedFirmwareBootloader}
            selectedLabel={BootModeTitles[selectedFirmwareBootloader]}
            toggleProps={{ isFullWidth: true }}
          >
            <SelectList>
              {bootloaderOptions.map(({ description, title, value }) => (
                <SelectOption description={description} key={value} value={value}>
                  {title}
                </SelectOption>
              ))}
            </SelectList>
          </FormPFSelect>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default FirmwareBootloaderModal;
