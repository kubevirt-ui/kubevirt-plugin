import React, { ChangeEvent, FC, useMemo, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { checkBootModeChanged } from '../PendingChanges/utils/helpers';

import { bootloaderOptions } from './utils/constants';
import { BootloaderOptionValue } from './utils/types';
import { getBootloaderFromVM, updatedVMBootMode } from './utils/utils';

type FirmwareBootloaderModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
};

const FirmwareBootloaderModal: FC<FirmwareBootloaderModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSubmit,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFirmwareBootloader, setSelectedFirmwareBootloader] =
    useState<BootloaderOptionValue>(getBootloaderFromVM(vm));

  const handleChange = (event: ChangeEvent<HTMLSelectElement>, value: BootloaderOptionValue) => {
    event.preventDefault();
    setSelectedFirmwareBootloader(value);
    setIsDropdownOpen(false);
  };

  const updatedVirtualMachine = useMemo(
    () => updatedVMBootMode(vm, selectedFirmwareBootloader),
    [vm, selectedFirmwareBootloader],
  );

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
