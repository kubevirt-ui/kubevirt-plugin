import { type FC, type MouseEvent } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { renderColumnCell } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { getDescription } from '@kubevirt-utils/resources/shared';
import { INTERACTIVE_SELECTOR } from '@kubevirt-utils/utils/constants';
import { Radio } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { type VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import { getCloneSourceVMName, getVMConfiguration } from '../utils/utils';

type VirtualMachineRowProps = {
  callbacks: VMCallbacks;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  vm: V1VirtualMachine;
};

const VirtualMachineRow: FC<VirtualMachineRowProps> = ({ callbacks, columns, vm }) => {
  const { control, setValue } = useVMWizardForm();
  const selectedSource = useWatch({ control, name: 'clone.sourceVM' });

  const { isRowSelected, rowId } = getVMConfiguration(vm, selectedSource);

  const selectSourceVM = (): void => {
    const options = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const;

    setValue('clone.sourceVM', vm, options);
    setValue('deployment.name', getCloneSourceVMName(vm), options);
    setValue('deployment.description', getDescription(vm) ?? '', options);
  };

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>): void => {
    const target = event.target as HTMLElement;

    if (!event.currentTarget.contains(target)) {
      return;
    }

    if (target.closest(INTERACTIVE_SELECTOR)) {
      return;
    }

    if (isRowSelected) {
      return;
    }

    selectSourceVM();
  };

  return (
    <Tr isRowSelected={isRowSelected} onClick={handleRowClick}>
      <Td className="pf-v6-u-pl-sm">
        <Radio
          id={`select-vm-${rowId}`}
          isChecked={isRowSelected}
          name="clone-source-vm"
          onChange={selectSourceVM}
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
