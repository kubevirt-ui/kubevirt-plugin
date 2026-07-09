import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getDescription } from '@kubevirt-utils/resources/shared';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { Radio } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

import { getCloneSourceVMName, getVMConfiguration } from '../utils/utils';

type VirtualMachineRowProps = {
  callbacks: VMCallbacks;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  vm: V1VirtualMachine;
};

const VirtualMachineRow: FC<VirtualMachineRowProps> = ({ callbacks, columns, vm }) => {
  const { setValue } = useVMWizard();

  const { isRowSelected, rowId } = getVMConfiguration(vm);

  const handleClick = () => {
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.NAME, getCloneSourceVMName(vm));
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION, getDescription(vm) ?? '');
    vmSignal.value = vm;
  };

  return (
    <Tr isRowSelected={isRowSelected} onClick={handleClick}>
      <Td className="pf-v6-u-pl-sm">
        <Radio
          id={`select-vm-${rowId}`}
          isChecked={isRowSelected}
          name="clone-source-vm"
          onChange={handleClick}
        />
      </Td>
      {columns.map((col) => (
        <Td key={col.key} {...col.props}>
          {col.renderCell(vm, callbacks)}
        </Td>
      ))}
    </Tr>
  );
};

export default VirtualMachineRow;
