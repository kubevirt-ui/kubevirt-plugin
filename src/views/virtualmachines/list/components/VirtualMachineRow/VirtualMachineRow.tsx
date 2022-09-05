import * as React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from '../../../utils';

import VirtualMachineRowLayout from './VirtualMachineRowLayout';
import VirtualMachineRunningRow from './VirtualMachineRunningRow';

const VirtualMachineRow: React.FC<
  RowProps<
    V1VirtualMachine,
    {
      kind: string;
      getVmi: (namespace: string, name: string) => V1VirtualMachineInstance;
      getVmim: (ns: string, name: string) => V1VirtualMachineInstanceMigration;
    }
  >
> = ({ obj, activeColumnIDs, rowData: { kind, getVmi, getVmim } }) => {
  return obj?.status?.printableStatus === printableVMStatus.Running ? (
    <VirtualMachineRunningRow
      obj={obj}
      activeColumnIDs={activeColumnIDs}
      rowData={{
        kind,
        vmi: getVmi(obj?.metadata?.namespace, obj?.metadata?.name),
        vmim: getVmim(obj?.metadata?.namespace, obj?.metadata?.name),
      }}
    />
  ) : (
    <VirtualMachineRowLayout
      obj={obj}
      activeColumnIDs={activeColumnIDs}
      rowData={{ kind, node: NO_DATA_DASH, ips: NO_DATA_DASH, vmim: null }}
    />
  );
};

export default VirtualMachineRow;
