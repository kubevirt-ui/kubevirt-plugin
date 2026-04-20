import React, { FCC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Td, Tr } from '@patternfly/react-table';
import { VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';

type VirtualMachineRowProps = {
  callbacks: VMCallbacks;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  selectedVMState: [V1VirtualMachine, (vm: V1VirtualMachine) => void];
  vm: V1VirtualMachine;
};

const VirtualMachineRow: FCC<VirtualMachineRowProps> = ({
  callbacks,
  columns,
  selectedVMState,
  vm,
}) => {
  const [selectedVM, setSelectedVM] = selectedVMState;

  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);
  const vmCluster = getCluster(vm);

  const selectedVMName = getName(selectedVM);
  const selectedVMNamespace = getNamespace(selectedVM);
  const selectedVMCluster = getCluster(selectedVM);

  const isRowSelected =
    vmName === selectedVMName &&
    vmNamespace === selectedVMNamespace &&
    vmCluster === selectedVMCluster;

  const handleOnClick = () => {
    setSelectedVM(vm);
  };

  return (
    <Tr isClickable isRowSelected={isRowSelected} isSelectable onClick={handleOnClick}>
      {columns.map((col) => (
        <Td key={col.key} {...col.props}>
          {col.renderCell(vm, callbacks)}
        </Td>
      ))}
    </Tr>
  );
};

export default VirtualMachineRow;
