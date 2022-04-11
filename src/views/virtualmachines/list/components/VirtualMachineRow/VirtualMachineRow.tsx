import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../../utils';

import VirtualMachineRowLayout from './VirtualMachineRowLayout';
import VirtualMachineRunningRow from './VirtualMachineRunningRow';

const VirtualMachineRow: React.FC<
  RowProps<V1VirtualMachine, { kind: string; vmis: V1VirtualMachineInstance[] }>
> = ({ obj, activeColumnIDs, rowData: { kind, vmis } }) => {
  return obj?.status?.printableStatus === printableVMStatus.Running ? (
    <VirtualMachineRunningRow
      obj={obj}
      activeColumnIDs={activeColumnIDs}
      rowData={{ kind, vmi: vmis?.find((vmi) => vmi?.metadata?.name === obj?.metadata?.name) }}
    />
  ) : (
    <VirtualMachineRowLayout
      obj={obj}
      activeColumnIDs={activeColumnIDs}
      rowData={{ kind, node: NO_DATA_DASH, ips: NO_DATA_DASH }}
    />
  );
};

export default VirtualMachineRow;
