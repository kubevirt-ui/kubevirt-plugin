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
      getVmi: (namespace: string, name: string) => V1VirtualMachineInstance;
      getVmim: (ns: string, name: string) => V1VirtualMachineInstanceMigration;
      isSingleNodeCluster: boolean;
      kind: string;
    }
  >
> = ({ activeColumnIDs, obj, rowData: { getVmi, getVmim, isSingleNodeCluster, kind } }) => {
  return obj?.status?.printableStatus === printableVMStatus.Running ? (
    <VirtualMachineRunningRow
      rowData={{
        isSingleNodeCluster,
        kind,
        vmi: getVmi(obj?.metadata?.namespace, obj?.metadata?.name),
        vmim: getVmim(obj?.metadata?.namespace, obj?.metadata?.name),
      }}
      activeColumnIDs={activeColumnIDs}
      obj={obj}
    />
  ) : (
    <VirtualMachineRowLayout
      activeColumnIDs={activeColumnIDs}
      obj={obj}
      rowData={{ ips: NO_DATA_DASH, isSingleNodeCluster, kind, node: NO_DATA_DASH, vmim: null }}
    />
  );
};

export default VirtualMachineRow;
