import React, { FCC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import LoadingSkeleton from '@virtualmachines/list/components/OverviewTab/widgets/ClusterStatusWidget/components/TwoColumnCard/LoadingSkeleton';
import { VMCallbacks } from '@virtualmachines/list/virtualMachinesDefinition';

import VirtualMachineRow from './VirtualMachineRow';

type VirtualMachineTableProps = {
  callbacks: VMCallbacks;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  data: V1VirtualMachine[];
  loaded: boolean;
  loadError: Error;
  selectedVMState: [V1VirtualMachine, (vm: V1VirtualMachine) => void];
};

const VirtualMachineTable: FCC<VirtualMachineTableProps> = ({
  callbacks,
  columns,
  data,
  loaded,
  loadError,
  selectedVMState,
}) => {
  const { t } = useKubevirtTranslation();
  const { cluster } = useVMWizardStore();

  if (loadError) {
    return (
      <div className="pf-v6-u-text-align-center pf-v6-u-py-lg">
        {t('Error loading virtual machines: {{error}}', { error: loadError.message })}
      </div>
    );
  }

  if (!loaded) {
    return <LoadingSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="pf-v6-u-text-align-center pf-v6-u-py-lg">{t('No VirtualMachines found')}</div>
    );
  }

  return (
    <Table className="VirtualMachineList-table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {columns.map((col) => (
            <Th id={col?.key} key={col?.key}>
              {col?.label}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((vm) => (
          <VirtualMachineRow
            callbacks={callbacks}
            columns={columns}
            key={`${cluster}-${getNamespace(vm)}-${getName(vm)}`}
            selectedVMState={selectedVMState}
            vm={vm}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default VirtualMachineTable;
