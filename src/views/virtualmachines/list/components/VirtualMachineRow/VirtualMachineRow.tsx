import React, { FC } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowProps } from '@openshift-console/dynamic-plugin-sdk';
import VirtualMachineMigrationPercentage from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineMigrationPercentage';
import StatusWithPopover from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineStatusWithPopover/VirtualMachineStatusWithPopover';
import { printableVMStatus } from '@virtualmachines/utils';

import VirtualMachineRowLayout from './VirtualMachineRowLayout';
import VirtualMachineRunningRow from './VirtualMachineRunningRow';

const VirtualMachineRow: FC<
  RowProps<
    V1VirtualMachine,
    {
      getVmi: (namespace: string, name: string) => V1VirtualMachineInstance;
      getVmim: (ns: string, name: string) => V1VirtualMachineInstanceMigration;
      isSingleNodeCluster: boolean;
    }
  >
> = ({ activeColumnIDs, obj: vm, rowData: { getVmi, getVmim, isSingleNodeCluster } }) => {
  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);
  const vmi = getVmi(vmNamespace, vmName);
  const status = (
    <>
      <StatusWithPopover vm={vm} vmi={vmi} />
      {vm?.status?.printableStatus === printableVMStatus.Migrating && (
        <VirtualMachineMigrationPercentage vm={vm} />
      )}
    </>
  );
  return !isEmpty(vmi) ? (
    <VirtualMachineRunningRow
      rowData={{
        isSingleNodeCluster,
        status,
        vmi,
        vmim: getVmim(vmNamespace, vmName),
      }}
      activeColumnIDs={activeColumnIDs}
      obj={vm}
    />
  ) : (
    <VirtualMachineRowLayout
      activeColumnIDs={activeColumnIDs}
      obj={vm}
      rowData={{ ips: NO_DATA_DASH, isSingleNodeCluster, node: NO_DATA_DASH, status, vmim: null }}
    />
  );
};

export default VirtualMachineRow;
