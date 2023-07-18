import React, { ChangeEvent, FC, useMemo, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { bootloaderOptions } from './utils/constants';
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
      headerText={t('Boot mode')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && <ModalPendingChangesAlert />}
        <FormGroup fieldId="firmware-bootloader" label={t('Boot mode')}>
          <Select
            isOpen={isDropdownOpen}
            menuAppendTo="parent"
            onSelect={handleChange}
            onToggle={setIsDropdownOpen}
            selections={selectedFirmwareBootloader}
            variant={SelectVariant.single}
          >
            {bootloaderOptions.map(({ description, title, value }) => (
              <SelectOption description={description} key={value} value={value}>
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
