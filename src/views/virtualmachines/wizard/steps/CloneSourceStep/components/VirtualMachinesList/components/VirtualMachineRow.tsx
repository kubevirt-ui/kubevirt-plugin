import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { renderColumnCell } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { getDescription } from '@kubevirt-utils/resources/shared';
import { Radio } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { type VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';

import { getCloneSourceVMName, getVMConfiguration } from '../utils/utils';

type VirtualMachineRowProps = {
  callbacks: VMCallbacks;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  vm: V1VirtualMachine;
};

const VirtualMachineRow: FC<VirtualMachineRowProps> = ({ callbacks, columns, vm }) => {
  const { control, setValue } = useVMWizard();
  const selectedVM = useWatch({ control, name: 'clone.sourceVM' });

  const { isRowSelected, rowId } = getVMConfiguration(vm, selectedVM);

  const handleClick = (): void => {
    setValue('deployment.name', getCloneSourceVMName(vm));
    setValue('deployment.description', getDescription(vm) ?? '');
    setValue('clone.sourceVM', vm);
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
          {renderColumnCell(col, vm, callbacks)}
        </Td>
      ))}
    </Tr>
  );
};

export default VirtualMachineRow;
